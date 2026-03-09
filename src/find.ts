import { get } from "./http";
import type { IAddress, IPoint } from "./interfaces";
import * as utils from "./utils";

interface PointFinderResponse {
  PointStatus: string;
  Status: { Code: string; Message?: string };
  Points?: string[];
}

async function pointFinder(
  name: string,
  stopsOnly: boolean,
  assignedStops: boolean,
  timeout = 15000,
): Promise<IPoint[]> {
  if (typeof name !== "string") {
    throw utils.constructError("ValidationError", "query has to be a string");
  }

  const stopName = name.trim();

  const data = await get<PointFinderResponse>({
    url: "https://webapi.vvo-online.de/tr/pointfinder",
    params: {
      format: "json",
      stopsOnly,
      assignedStops,
      limit: 0,
      query: stopName,
      dvb: true,
    },
    timeout,
  });

  utils.checkStatus(data);

  const result: IPoint[] = [];
  if (data.Points) {
    for (const p of data.Points) {
      const poi = p.split("|");

      const coords = utils.WmOrGK4toWGS84(poi[5], poi[4]);
      const pointName = poi[3].replace(/'/g, "");

      if (pointName && coords) {
        const city = poi[2] === "" ? "Dresden" : poi[2];
        const { id, type } = utils.parsePoiID(poi[0]);

        result.push({
          city,
          coords,
          name: pointName,
          id,
          type,
        });
      }
    }
  }

  return result;
}

/**
 * Search for a single stop in the network of the DVB.
 * @param searchString the name of the stop
 * @param timeout the timeout of the request
 * @returns an array of all possible hits including their GPS coordinates.
 */
export function findStop(searchString: string, timeout = 15000): Promise<IPoint[]> {
  return pointFinder(searchString, true, false, timeout);
}

/**
 * Search for POI in the network of the DVB.
 * @param searchString the name of the stop
 * @param timeout the timeout of the request
 * @returns an array of all possible hits including their GPS coordinates.
 */
export function findPOI(searchString: string, timeout = 15000): Promise<IPoint[]> {
  return pointFinder(searchString, false, false, timeout);
}

/**
 * Search for nearby stops assigned to an address in the network of the DVB.
 * @param searchString the lookup address
 * @returns an array of all possible hits including their GPS coordinates.
 */
export async function findNearbyStops(searchString: string, timeout = 15000): Promise<IPoint[]> {
  const aPoints = await pointFinder(searchString, false, true, timeout);
  return aPoints.filter((oPoint) => oPoint.type === "Stop");
}

/**
 * Lookup address and nearby stops by coordinate.
 * @param lng longitude of the coordinate
 * @param lat latitude of the coordinate
 * @param timeout the timeout of the request
 * @returns the adress and neaby stops
 */
export async function findAddress(
  lng: number,
  lat: number,
  timeout = 15000,
): Promise<IAddress | undefined> {
  const gk4 = utils.WGS84toGK4(lng, lat);

  const points = await pointFinder(`coord:${gk4[0]}:${gk4[1]}`, false, true, timeout);
  if (points.length === 0) {
    return undefined;
  }

  return {
    ...points[0],
    stops: points.slice(1) || [],
  };
}
