import axios, { AxiosRequestConfig } from "axios";
import { IMonitor } from "./interfaces";
import * as utils from "./utils";

/**
 * Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.
 * @param stopID ID of the stop
 * @param offset how many minutes in the future, 0 for now
 * @param amount number of results
 */
export function monitor(
  stopID: string,
  offset = 0,
  amount = 0
): Promise<IMonitor[]> {
  const now = new Date();
  const time = new Date(now.getTime() + offset * 60 * 1000);

  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/dm",
    params: {
      format: "json",
      stopid: stopID,
      time: time.toISOString(),
      isarrival: false,
      limit: amount,
      shorttermchanges: true,
      mentzonly: false,
    },
    timeout: 5000,
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      if (response.data.Departures) {
        return response.data.Departures.map((d: any) => {
          const arrivalTime = utils.parseDate(
            d.RealTime ? d.RealTime : d.ScheduledTime
          );
          const scheduledTime = utils.parseDate(d.ScheduledTime);

          return {
            arrivalTime,
            scheduledTime,
            id: d.Id,
            line: d.LineName,
            direction: d.Direction,
            platform: utils.parsePlatform(d.Platform),
            arrivalTimeRelative: dateDifference(now, arrivalTime),
            scheduledTimeRelative: dateDifference(now, scheduledTime),
            delayTime: dateDifference(scheduledTime, arrivalTime),
            state: d.State ? d.State : "Unknown",
            mode: utils.parseMode(d.Mot),
            diva: utils.parseDiva(d.Diva),
          };
        });
      }

      return [];
    })
    .catch(utils.convertError);
}

function dateDifference(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 1000 / 60);
}
