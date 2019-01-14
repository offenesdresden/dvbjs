import axios, { AxiosRequestConfig } from "axios";
import * as utils from "./utils";

/**
 * Find the coordinates for a given POI id.
 * @param id the POI ID
 * @returns coordinate as [lng, lat] or undefined
 */
export function coords(id: string): Promise<number[] | undefined> {

  const options: AxiosRequestConfig = {
    url: "https://www.dvb.de/apps/map/coordinates",
    params: {
      id,
    },
    responseType: "text",
    timeout: 5000,
  };

  return axios(options)
    .then((response) => {
      if (!response.data) {
        return undefined;
      }

      const coordinates = response.data.split("|");

      return utils.GK4toWGS84(coordinates[1], coordinates[0]);
    });
}
