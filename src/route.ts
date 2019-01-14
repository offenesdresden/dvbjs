import axios, { AxiosRequestConfig } from "axios";
import { ILocation, IRoute } from "./interfaces";
import * as utils from "./utils";

/**
 * Query the server for possible routes from one stop to another.
 * @param originID the id of the origin stop
 * @param destinationID the id of the destination stop
 * @param time starting at what time
 * @param isArrivalTime is time the arrival time
 * @returns Returns multiple possible trips, the bus-/tramlines to be taken,
 * the single stops, their arrival and departure times and their GPS coordinates.
 * The path property of a trip contains an array consisting of all the coordinates
 * describing the path of this node. This can be useful to draw the route on a map.
 */
export function route(
  originID: string,
  destinationID: string,
  time = new Date(),
  isArrivalTime = true
): Promise<IRoute> {
  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/tr/trips",
    params: {
      format: "json",
      origin: originID,
      destination: destinationID,
      isarrivaltime: isArrivalTime,
      shorttermchanges: true,
      time: time.toISOString(),
    },
    timeout: 5000,
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      if (response.data.Routes) {
        const trips = response.data.Routes.map(utils.extractTrip);

        let origin: ILocation | undefined;
        let destination: ILocation | undefined;

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
    .catch(utils.convertError);
}
