import axios, { AxiosRequestConfig } from "axios";
import { IPin, PIN_TYPE } from "./interfaces";
import * as utils from "./utils";

/**
 * Search for different kinds of POIs inside a given bounding box.
 * @param swlng the longitude of the south west coordinate
 * @param swlat the latitude of the south west coordinate
 * @param nelng the longitude of the north east coordinate
 * @param nelat the latitude of the north east coordinate
 * @param pinTypes array of pin types
 * @param timeout the timeout of the request
 */
export function pins(
  swlng: number,
  swlat: number,
  nelng: number,
  nelat: number,
  pinTypes: PIN_TYPE[] = [PIN_TYPE.stop],
  timeout = 15000
): Promise<IPin[]> {
  const sw = utils.WGS84toWm(swlng, swlat);
  const ne = utils.WGS84toWm(nelng, nelat);

  let url = "https://www.dvb.de/apps/map/pins?showLines=true";
  pinTypes.forEach((type) => (url += `&pintypes=${type}`));
  const options: AxiosRequestConfig = {
    url,
    params: {
      swlng: sw[0],
      swlat: sw[1],
      nelng: ne[0],
      nelat: ne[1],
    },
    responseType: "json",
    timeout,
  };

  return axios(options)
    .then((response) => {
      return response.data || [];
    })
    .then((elements) => elements.map((elem: string) => utils.parsePin(elem)));
}
