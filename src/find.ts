import axios, { AxiosRequestConfig } from "axios";
import { IAddress, IPoint } from "./interfaces";
import * as utils from "./utils";

function pointFinder(name: string, stopsOnly: boolean, assignedStops: boolean): Promise<IPoint[]> {
  if (typeof name !== "string") {
    throw utils.constructError("ValidationError", "query has to be a string");
  }

  const stopName = name.trim();

  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/tr/pointfinder",
    params: {
      format: "json",
      stopsOnly,
      assignedStops,
      limit: 0,
      query: stopName,
      dvb: true,
    },
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      if (response.data.Points) {
        return response.data.Points.map((p: string) => {
          const poi = p.split("|");

          const city = poi[2] === "" ? "Dresden" : poi[2];
          const idAndType = utils.parsePoiID(poi[0]);
          const coords = utils.GK4toWGS84(poi[5], poi[4]);

          if (coords) {
            const point: IPoint = {
              city,
              coords,
              name: poi[3].replace(/'/g, ""),
              id: idAndType.id,
              type: idAndType.type,
            };
            return point;
          }
        }).filter((p: IPoint) => p && p.name);
      }

      return [];
    })
    .catch(utils.convertError);
}

/**
 * Search for a single stop in the network of the DVB.
 * @param searchString the name of the stop
 * @returns an array of all possible hits including their GPS coordinates.
 */
export function findStop(searchString: string): Promise<IPoint[]> {
  return pointFinder(searchString, true, false);
}

/**
 * Search for POI in the network of the DVB.
 * @param searchString the name of the stop
 * @returns an array of all possible hits including their GPS coordinates.
 */
export function findPOI(searchString: string): Promise<IPoint[]> {
  return pointFinder(searchString, false, false);
}

/**
 * Lookup address and nearby stops by coordinate.
 * @param lng longitude of the coordinate
 * @param lat latitude of the coordinate
 * @returns the adress and neaby stops
 */
export function findAddress(lng: number, lat: number): Promise<IAddress | undefined> {

  const gk4 = utils.WGS84toGK4(lng, lat);

  return pointFinder(`coord:${gk4[0]}:${gk4[1]}`, false, true)
    .then((points) => {
      if (points.length === 0) {
        return undefined;
      }

      const address: IAddress = {
        ...points[0],
        stops: points.slice(1) || [],
      };

      return address;
    });
}
