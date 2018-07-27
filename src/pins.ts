import axios, { AxiosRequestConfig } from "axios";
import { IPin, PIN_TYPE } from "./interfaces";
import * as utils from "./utils";

export async function pins(swlat: number, swlng: number, nelat: number, nelng: number,
  pinType: PIN_TYPE): Promise<IPin[]> {

  const sw = utils.wgs84toGk4(swlat, swlng);
  const ne = utils.wgs84toGk4(nelat, nelng);

  const options: AxiosRequestConfig = {
    url: "https://www.dvb.de/apps/map/pins",
    params: {
      showLines: "true",
      swlat: sw[1],
      swlng: sw[0],
      nelat: ne[1],
      nelng: ne[0],
      pintypes: pinType,
    },
    responseType: "text",
  };

  return axios(options)
    .then((response) => {
      return response.data || [];
    })
    .then((elements) => elements.map((elem: string) => utils.parsePin(elem, pinType)));
}
