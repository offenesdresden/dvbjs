import * as requestP from 'request-promise';
import * as utils from './utils';
import { ILocation, Node, IRoute, IStop, IStopLocation, Trip } from './interfaces';
import bluebird = require('bluebird');

function extractStop(stop: any): IStop {
  return {
    name: stop.Name.trim(),
    city: stop.Place,
    type: stop.Type,
    platform: utils.parsePlatform(stop.Platform),
    coords: utils.gk4toWgs84(stop.Latitude, stop.Longitude),
    arrival: utils.parseDate(stop.ArrivalTime),
    departure: utils.parseDate(stop.DepartureTime),
  };
}

function extractNode(node: any, mapData: any): Node {
  const stops: IStop[] = node.RegularStops ? node.RegularStops.map(extractStop) : undefined;

  let departure: IStopLocation;
  let arrival: IStopLocation;

  if (stops) {
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
    mode: utils.parseMode(node.Mot.Type),
    line: node.Mot.Name ? node.Mot.Name : '',
    direction: node.Mot.Direction ? node.Mot.Direction.trim() : '',
    diva: utils.parseDiva(node.Mot.Diva),
    duration: node.Duration,
    path: utils.convertCoordinates(mapData[node.MapDataIndex]),
  };
}

function extractTrip(trip: any): Trip {
  const nodes: Node[] = trip.PartialRoutes.map((node: any) => extractNode(node, trip.MapData));

  return {
    nodes,
    departure: nodes[0].departure,
    arrival: nodes[nodes.length - 1].arrival,
    duration: trip.Duration,
    interchanges: trip.Interchanges,
  };
}

export function route(originID: string, destinationID: string, time: Date, isArrivalTime: boolean,
                      callback?: (value: IRoute, err?: Error) => void): bluebird<IRoute> {

  const date = time || new Date();

  const options = {
    url: 'https://webapi.vvo-online.de/tr/trips?format=json',
    qs: {
      origin: originID,
      destination: destinationID,
      isarrivaltime: isArrivalTime === true,
      shorttermchanges: true,
      time: date.toISOString(),
    },
    json: true,
  };

  return requestP(options)
    .then((data: { Routes?: {}[] }) => {
      // check status of response
      utils.checkStatus(data);

      if (data.Routes) {
        const trips = data.Routes.map(extractTrip);

        let origin: ILocation;
        let destination: ILocation;

        if (trips && trips.length > 0) {
          const firstTrip = trips[0];

          origin = {
            name: firstTrip.departure.name,
            city: firstTrip.departure.city,
            coords: firstTrip.departure.coords,
          };
          destination = {
            name: firstTrip.arrival.name,
            city: firstTrip.arrival.city,
            coords: firstTrip.arrival.coords,
          };
        }

        return {
          origin,
          destination,
          trips,
        };
      }

      return {
        origin: undefined,
        destination: undefined,
        trips: [],
      };
    })
    // .catch(utils.convertError)
    .nodeify(callback);
}
