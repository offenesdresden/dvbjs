import proj4 from "proj4";
import {
  coord,
  IConnection,
  IDiva,
  IMode,
  IPin,
  IPlatform,
  PIN_TYPE,
  POI_TYPE,
} from "./interfaces";

proj4.defs(
  "GK4",
  "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs",
);

export function wgs84toGk4(lat: number, lng: number): coord {
  return proj4("GK4").forward([Number(lng), Number(lat)]).map(Math.round);
}

export function gk4toWgs84(lat: string, lng: string): coord {
  const latInt = parseInt(lat, 10);
  const lngInt = parseInt(lng, 10);

  if (latInt === 0 && lngInt === 0) {
    return [undefined, undefined];
  }

  if (isNaN(latInt) || isNaN(lngInt)) {
    return [undefined, undefined];
  }

  return proj4("GK4").inverse([lngInt, latInt]).reverse();
}

export function convertCoordinates(s: string): coord[] {
  const coords = [];

  if (s) {
    const gk4Chords = s.split("|");

    let i = 1;
    const len = gk4Chords.length - 1;
    while (i < len) {
      coords.push(gk4toWgs84(gk4Chords[i], gk4Chords[i + 1]));
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

export function constructError(name: string, message = ""): Error {
  const error = new Error(message);
  if (name) {
    error.name = name;
  }
  return error;
}

export function convertError(err: any): never {
  if (err.response && err.response.data && err.response.data.Status) {
    throw constructError(err.response.data.Status.Code, err.response.data.Status.Message);
  }
  throw err;
}

export function parseDate(d: string): Date {
  return new Date(parseInt(d.match(/\d+/)[0], 10));
}

export function parseDiva(d: any): IDiva | undefined {
  return d && d.Number ? { number: parseInt(d.Number, 10), network: d.Network } : undefined;
}

export function parsePlatform(p: any): IPlatform | undefined {
  return p ? { name: p.Name, type: p.Type } : undefined;
}

export function parsePin(dataAsString: string, pinType: PIN_TYPE): IPin {
  const data = dataAsString.split("|");
  const coords = gk4toWgs84(data[4], data[5]);

  if (pinType === PIN_TYPE.platform) {
    return {
      coords,
      id: undefined,
      name: data[3],
      platform_nr: data[6],
      type: pinType,
    };
  }
  if (pinType === PIN_TYPE.poi || pinType === PIN_TYPE.rentabike
    || pinType === PIN_TYPE.ticketmachine || pinType === PIN_TYPE.carsharing
    || pinType === PIN_TYPE.parkandride) {
    return {
      coords,
      id: data[0],
      name: data[3],
      type: pinType,
    };
  }

  // 'stop' id default
  return {
    coords,
    id: data[0],
    name: data[3],
    connections: parseConnections(data[7]),
    type: pinType,
  };
}

export function parseMode(name: string): IMode {
  switch (name.toLowerCase()) {
    case "tram":
      return MODES.Tram;
    case "bus":
    case "citybus":
    case "intercitybus":
      return MODES.Bus;
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

function parseConnections(data: string): IConnection[] {
  let connections: IConnection[] = [];

  data.split("#").forEach((types) => {
    const typesArray = types.split(":");
    connections = connections.concat(typesArray[1].split("~").map((line) => ({
      line,
      type: typesArray[0],
    })));
  });

  return connections;
}

export const MODES = {
  Tram: {
    title: "Straßenbahn",
    name: "Tram",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-tram.svg",
  },
  Bus: {
    title: "Bus",
    name: "Bus",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg",
  },
  SuburbanRailway: {
    title: "S-Bahn",
    name: "SuburbanRailway",
    icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg",
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
