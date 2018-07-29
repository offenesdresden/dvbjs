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
 */
export function lines(stopID: string): Promise<ILine[]> {

  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/stt/lines",
    params: {
      format: "json",
      stopid: stopID,
    },
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      if (response.data.Lines) {
        return response.data.Lines.map(parseLine);
      }

      return [];
    })
    .catch(utils.convertError);
}
