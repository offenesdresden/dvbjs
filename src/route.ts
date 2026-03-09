import { post } from "./http";
import type { ILocation, IRoute, ITrip } from "./interfaces";
import * as utils from "./utils";

interface TripsResponse {
  Status: { Code: string; Message?: string };
  Routes?: Array<{
    RouteId: number;
    Duration: number;
    Interchanges: number;
    PartialRoutes: Array<{
      Duration: number;
      MapDataIndex: number;
      Mot: {
        Type?: string;
        Name?: string;
        Direction?: string;
        DlId?: string;
        Diva?: { Number: string; Network: string };
      };
      RegularStops?: Array<{
        DataId: string;
        DhId: string;
        Name: string;
        Place: string;
        Type: string;
        Platform?: { Name: string; Type: string };
        Latitude: number;
        Longitude: number;
        ArrivalTime: string;
        DepartureTime: string;
      }>;
    }>;
    MapData: string[];
  }>;
}

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
): Promise<IRoute> {
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

  let origin: ILocation | undefined;
  let destination: ILocation | undefined;
  let trips: ITrip[] = [];

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
