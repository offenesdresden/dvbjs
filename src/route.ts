import type { TripsResponse } from "./api-types";
import { post } from "./http";
import type { Location, Route, Trip } from "./interfaces";
import * as utils from "./utils";

/**
 * Query the server for possible routes from one stop to another.
 * @param originID the id of the origin stop
 * @param destinationID the id of the destination stop
 * @param time starting at what time
 * @param isArrivalTime is time the arrival time
 * @param timeout the timeout of the request
 * @param via the id of a stop which must be served by the route
 */
export async function route(
  originID: string,
  destinationID: string,
  time = new Date(),
  isArrivalTime = true,
  timeout = 15000,
  via?: string,
): Promise<Route> {
  const data = await post<TripsResponse>({
    url: "https://webapi.vvo-online.de/tr/trips",
    body: {
      format: "json",
      origin: originID,
      destination: destinationID,
      isarrivaltime: isArrivalTime,
      shorttermchanges: true,
      time: time.toISOString(),
      via,
    },
    timeout,
  });

  utils.checkStatus(data);

  let origin: Location | undefined;
  let destination: Location | undefined;
  let trips: Trip[] = [];

  if (data.Routes) {
    trips = data.Routes.map(utils.extractTrip);

    if (trips.length > 0) {
      const firstTrip = trips[0];
      if (firstTrip.departure) {
        origin = {
          id: firstTrip.departure.id,
          name: firstTrip.departure.name,
          city: firstTrip.departure.city,
          coords: firstTrip.departure.coords,
        };
      }
      if (firstTrip.arrival) {
        destination = {
          id: firstTrip.arrival.id,
          name: firstTrip.arrival.name,
          city: firstTrip.arrival.city,
          coords: firstTrip.arrival.coords,
        };
      }
    }
  }

  return { origin, destination, trips };
}
