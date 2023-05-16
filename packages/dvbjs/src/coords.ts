/* eslint @typescript-eslint/no-non-null-assertion: 0 */

import axios, { AxiosRequestConfig } from "axios";
import * as utils from "./utils";

/**
 * Find the coordinates for a given POI id.
 * @param id the POI ID
 * @param timeout the timeout of the request
 * @returns coordinate as [lng, lat] or undefined
 */
export function coords(
  id: string,
  timeout = 15000
): Promise<number[] | undefined> {
  const options: AxiosRequestConfig = {
    url: "https://www.dvb.de/apps/map/coordinates",
    params: {
      id,
    },
    responseType: "json",
    timeout,
  };

  return axios(options).then((response) => {
    if (response.data && response.data.split("|").length === 2) {
      const coordinates = response.data.split("|");
      return utils.WmOrGK4toWGS84(coordinates[1], coordinates[0]);
    }

    return undefined;
  });
}
