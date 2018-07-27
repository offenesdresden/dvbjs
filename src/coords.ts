import axios, { AxiosRequestConfig } from "axios";
import * as utils from "./utils";

/** Patch section titled API of README.md file in given directory. */
export function coords(id: string): Promise<number[] | undefined> {

  const options: AxiosRequestConfig = {
    url: "https://www.dvb.de/apps/map/coordinates",
    params: {
      id,
    },
    responseType: "text",
  };

  return axios(options)
    .then((response) => {
      if (!response.data) {
        return undefined;
      }

      const coordinates = response.data.split("|");

      return utils.gk4toWgs84(coordinates[0], coordinates[1]);
    });
}
