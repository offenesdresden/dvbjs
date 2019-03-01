import proj4 from "proj4";
import {
  coord,
  IConnection,
  IDiva,
  IMode,
  INode,
  IPin,
  IPlatform,
  IStop,
  IStopLocation,
  ITrip,
  PIN_TYPE,
  POI_TYPE,
} from "./interfaces";

// EPSG:31468
proj4.defs(
  "GK4",
  "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"
);

// EPSG:3857
proj4.defs(
  "WM",
  "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

export function WGS84toGK4(lng: number, lat: number): coord {
  return proj4("WGS84", "GK4", [lng, lat]).map(Math.round);
}

export function WGS84toWm(lng: number, lat: number): coord {
  return proj4("WGS84", "WM", [lng, lat]).map(Math.round);
}

export function WmOrGK4toWGS84(lng: string, lat: string): coord | undefined {
  const latInt = parseInt(lat, 10);
  const lngInt = parseInt(lng, 10);

  if (latInt === 0 && lngInt === 0) {
    return undefined;
  }

  if (isNaN(latInt) || isNaN(lngInt)) {
    return undefined;
  }

  if (lngInt < 2500000) {
    return proj4("WM", "WGS84", [lngInt, latInt]);
  } else {
    return proj4("GK4", "WGS84", [lngInt, latInt]);
  }
}

export function convertCoordinates(s: string): coord[] {
  const coords = [];

  if (s) {
    const gk4Chords = s.split("|");

    let i = 1;
    const len = gk4Chords.length - 1;
    while (i < len) {
      const coordinate = WmOrGK4toWGS84(gk4Chords[i + 1], gk4Chords[i]);
      if (coordinate) {
        coords.push(coordinate);
      }
      i += 2;
    }
  }

  return coords;
}

export function checkStatus(data: any): void {
  if (!data || !data.Status) {
    throw new Error("unexpected error");
  }
  if (data.Status.Code !== "Ok") {
    const error = new Error(data.Status.Message);
    error.name = data.Status.Code;
    throw error;
  }
}

export function constructError(name?: string, message = ""): Error {
  const error = new Error(message);
  if (name) {
    error.name = name;
  }
  return error;
}

export function convertError(err: any): never {
  if (err.response && err.response.data && err.response.data.Status) {
    throw constructError(
      err.response.data.Status.Code,
      err.response.data.Status.Message
    );
  }
  throw err;
}

export function parseDate(d: string): Date {
  const matches = d.match(/\d+/);
  return new Date(parseInt(matches![0], 10));
}

export function parseDiva(d: any): IDiva | undefined {
  return d && d.Number
    ? { number: parseInt(d.Number, 10), network: d.Network }
    : undefined;
}

export function parsePlatform(p?: any): IPlatform | undefined {
  return p ? { name: p.Name, type: p.Type } : undefined;
}

function pinType(str: string): PIN_TYPE {
  switch (str) {
    case "":
      return PIN_TYPE.stop;
    case "p":
      return PIN_TYPE.poi;
    case "pf":
      return PIN_TYPE.platform;
    case "pr":
      return PIN_TYPE.parkandride;
    case "r":
      return PIN_TYPE.rentabike;
    case "c":
      return PIN_TYPE.carsharing;
    case "t":
      return PIN_TYPE.ticketmachine;
  }
  return PIN_TYPE.unknown;
}

export function parsePin(dataAsString: string): IPin {
  const data = dataAsString.split("|");
  const coords = WmOrGK4toWGS84(data[5], data[4]) || [];

  const type = pinType(data[1]);

  if (type === PIN_TYPE.platform) {
    return {
      coords,
      id: data[0],
      name: data[3],
      platform_nr: data[6],
      type,
    };
  }
  if (
    type === PIN_TYPE.poi ||
    type === PIN_TYPE.rentabike ||
    type === PIN_TYPE.ticketmachine ||
    type === PIN_TYPE.carsharing ||
    type === PIN_TYPE.unknown
  ) {
    return {
      coords,
      id: data[0],
      name: data[3],
      type,
    };
  }

  if (type === PIN_TYPE.parkandride) {
    return {
      coords,
      id: data[0],
      name: data[3],
      info: data[6],
      type,
    };
  }

  // 'stop' id default
  return {
    coords,
    id: data[0],
    name: data[3],
    connections: parseConnections(data[7]),
    type,
  };
}

export function parseMode(name: string): IMode {
  switch (name.toLowerCase()) {
    case "tram":
      return MODES.Tram;
    case "bus":
    case "citybus":
      return MODES.CityBus;
    case "intercitybus":
      return MODES.IntercityBus;
    case "suburbanrailway":
      return MODES.SuburbanRailway;
    case "train":
    case "rapidtransit":
      return MODES.Train;
    case "footpath":
      return MODES.Footpath;
    case "cableway":
    case "overheadrailway":
      return MODES.Cableway;
    case "ferry":
      return MODES.Ferry;
    case "hailedsharedtaxi":
      return MODES.HailedSharedTaxi;
    case "mobilitystairsup":
      return MODES.StairsUp;
    case "mobilitystairsdown":
      return MODES.StairsDown;
    case "mobilityescalatorup":
      return MODES.EscalatorUp;
    case "mobilityescalatordown":
      return MODES.EscalatorDown;
    case "mobilityelevatorup":
      return MODES.ElevatorUp;
    case "mobilityelevatordown":
      return MODES.ElevatorDown;
    case "stayforconnection":
      return MODES.StayForConnection;
    default:
      return {
        name,
        title: name.toLowerCase(),
      };
  }
}

export function parsePoiID(id: string) {
  let poiId = id.split(":");

  if (poiId.length >= 4) {
    poiId = poiId.slice(0, 4);

    switch (poiId[0]) {
      case "streetID":
        return {
          id: poiId.join(":"),
          type: POI_TYPE.Address,
        };
      case "coord":
        return {
          id: poiId.join(":"),
          type: POI_TYPE.Coords,
        };
      case "poiID":
        return {
          id: poiId.join(":"),
          type: POI_TYPE.POI,
        };
    }
  }
  return {
    id,
    type: POI_TYPE.Stop,
  };
}

function connectionType(str: string): IMode | undefined {
  switch (str) {
    case "1":
      return MODES.Tram;
    case "2":
      return MODES.CityBus;
    case "3":
      return MODES.IntercityBus;
    case "4":
      return MODES.Train;
    case "5":
      return MODES.SuburbanRailway;
    case "6":
      return MODES.HailedSharedTaxi;
    case "7":
      return MODES.Ferry;
    case "8":
      return MODES.Cableway;
  }
}

export function parseConnections(data: string): IConnection[] {
  let connections: IConnection[] = [];

  data.split("#").forEach((types) => {
    if (!types) {
      return [];
    }
    const typesArray = types.split(":");
    const mode = connectionType(typesArray[0]) as IMode;
    connections = connections.concat(
      typesArray[1].split("~").map((line) => ({
        line,
        mode,
      }))
    );
  });

  return connections;
}

function extractStop(stop: any): IStop {
  return {
    name: stop.Name.trim(),
    city: stop.Place,
    type: stop.Type,
    platform: parsePlatform(stop.Platform),
    coords: WmOrGK4toWGS84(stop.Longitude, stop.Latitude) || [0, 0],
    arrival: parseDate(stop.ArrivalTime),
    departure: parseDate(stop.DepartureTime),
  };
}

function extractNode(node: any, mapData: any): INode {
  const stops: IStop[] = node.RegularStops
    ? node.RegularStops.map(extractStop)
    : [];

  let departure: IStopLocation | undefined;
  let arrival: IStopLocation | undefined;

  if (stops && stops.length > 1) {
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    departure = {
      name: firstStop.name,
      city: firstStop.city,
      platform: firstStop.platform,
      time: firstStop.departure,
      coords: firstStop.coords,
      type: firstStop.type,
    };

    arrival = {
      name: lastStop.name,
      city: lastStop.city,
      platform: lastStop.platform,
      time: lastStop.arrival,
      coords: lastStop.coords,
      type: lastStop.type,
    };
  }

  return {
    stops,
    departure,
    arrival,
    mode: parseMode(node.Mot.Type),
    line: node.Mot.Name ? node.Mot.Name : "",
    direction: node.Mot.Direction ? node.Mot.Direction.trim() : "",
    diva: parseDiva(node.Mot.Diva),
    duration: node.Duration || 1,
    path: convertCoordinates(mapData[node.MapDataIndex]),
  };
}

export function extractTrip(trip: any): ITrip {
  const nodes: INode[] = trip.PartialRoutes.map((node: any) =>
    extractNode(node, trip.MapData)
  );

  return {
    nodes,
    departure: nodes[0].departure,
    arrival: nodes[nodes.length - 1].arrival,
    duration: trip.Duration || 1,
    interchanges: trip.Interchanges,
  };
}

export const MODES = {
  Tram: {
    title: "Straßenbahn",
    name: "Tram",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-tram.svg",
  },
  CityBus: {
    title: "Bus",
    name: "CityBus",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg",
  },
  IntercityBus: {
    title: "Regio-Bus",
    name: "IntercityBus",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg",
  },
  SuburbanRailway: {
    title: "S-Bahn",
    name: "SuburbanRailway",
    icon_url:
      "https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg",
  },
  Train: {
    title: "Zug",
    name: "Train",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-train.svg",
  },
  Cableway: {
    title: "Seil-/Schwebebahn",
    name: "Cableway",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-lift.svg",
  },
  Ferry: {
    title: "Fähre",
    name: "Ferry",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg",
  },
  HailedSharedTaxi: {
    title: "Anrufsammeltaxi (AST)/ Rufbus",
    name: "HailedSharedTaxi",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-alita.svg",
  },
  Footpath: {
    title: "Fussweg",
    name: "Footpath",
    icon_url: "https://m.dvb.de/img/walk.svg",
  },
  StairsUp: {
    title: "Treppe aufwärts",
    name: "StairsUp",
    icon_url: "https://m.dvb.de/img/stairs-up.svg",
  },
  StairsDown: {
    title: "Treppe abwärts",
    name: "StairsDown",
    icon_url: "https://m.dvb.de/img/stairs-down.svg",
  },
  EscalatorUp: {
    title: "Rolltreppe aufwärts",
    name: "EscalatorUp",
    icon_url: "https://m.dvb.de/img/escalator-up.svg",
  },
  EscalatorDown: {
    title: "Rolltreppe abwärts",
    name: "EscalatorDown",
    icon_url: "https://m.dvb.de/img/escalator-down.svg",
  },
  ElevatorUp: {
    title: "Fahrstuhl aufwärts",
    name: "ElevatorUp",
    icon_url: "https://m.dvb.de/img/elevator-up.svg",
  },
  ElevatorDown: {
    title: "Fahrstuhl abwärts",
    name: "ElevatorDown",
    icon_url: "https://m.dvb.de/img/elevator-down.svg",
  },
  StayForConnection: {
    title: "gesicherter Anschluss",
    name: "StayForConnection",
    icon_url: "https://m.dvb.de/img/sit.svg",
  },
};
