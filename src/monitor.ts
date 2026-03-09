import type { DepartureMonitorResponse } from "./api-types";
import { post } from "./http";
import type { Monitor } from "./interfaces";
import {
  checkStatus,
  dateDifference,
  parseDate,
  parseDiva,
  parseMode,
  parsePlatform,
} from "./utils";

/**
 * Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.
 * @param stopID ID of the stop
 * @param offset how many minutes in the future, 0 for now
 * @param amount number of results
 * @param timeout the timeout of the request
 */
export async function monitor(
  stopID: string,
  offset = 0,
  amount = 0,
  timeout = 15000,
): Promise<Monitor[]> {
  const now = new Date();
  const time = new Date(now.getTime() + offset * 60 * 1000);

  const data = await post<DepartureMonitorResponse>({
    url: "https://webapi.vvo-online.de/dm",
    body: {
      format: "json",
      stopid: stopID,
      time: time.toISOString(),
      isarrival: false,
      limit: amount,
      shorttermchanges: true,
      mentzonly: false,
    },
    timeout,
  });

  checkStatus(data);

  if (!data.Departures) {
    return [];
  }

  return data.Departures.map((d) => {
    const arrivalTime = parseDate(d.RealTime ? d.RealTime : d.ScheduledTime);
    const scheduledTime = parseDate(d.ScheduledTime);

    return {
      arrivalTime,
      scheduledTime,
      id: d.Id,
      line: d.LineName,
      direction: d.Direction,
      platform: parsePlatform(d.Platform),
      arrivalTimeRelative: dateDifference(now, arrivalTime),
      scheduledTimeRelative: dateDifference(now, scheduledTime),
      delayTime: dateDifference(scheduledTime, arrivalTime),
      state: d.State ? d.State : "Unknown",
      mode: parseMode(d.Mot),
      diva: parseDiva(d.Diva),
    };
  });
}
