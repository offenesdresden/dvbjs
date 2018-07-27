import axios, { AxiosRequestConfig } from "axios";
import { coord } from "./interfaces";
import * as utils from "./utils";

/** Patch section titled API of README.md file in given directory. */
export async function coords(id: string) {

  const options: AxiosRequestConfig = {
    url: "https://www.dvb.de/apps/map/coordinates",
    params: {
      id,
    },
    responseType: "text",
  };

  return axios(options)
    .then((response) => {
      if (response.data.length < 3) {
        return null;
      }

      const coordinates = response.data.split("|");

      return utils.gk4toWgs84(coordinates[0], coordinates[1]);
    });
}
