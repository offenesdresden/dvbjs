import axios, { AxiosRequestConfig } from "axios";
import { ILine } from "./interfaces";
import * as utils from "./utils";

function parseDirection(direction: any): string {
  return direction.Name;
}

function parseLine(line: any): ILine {
  return {
    name: line.Name,
    mode: utils.parseMode(line.Mot),
    diva: utils.parseDiva(line.Diva),
    directions: line.Directions.map(parseDirection),
  };
}
/**
 * get a list of availible tram/bus lines for a stop.
 * @param stopID the stop ID
 * @param timeout the timeout of the request
 */
export function lines(stopID: string, timeout = 15000): Promise<ILine[]> {
  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/stt/lines",
    params: {
      format: "json",
      stopid: stopID,
    },
    timeout,
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      let result: ILine[] = [];
      if (response.data.Lines) {
        result = response.data.Lines.map((l: any): ILine => parseLine(l));
      }

      return result;
    })
    .catch(utils.convertError);
}
