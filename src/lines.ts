import { post } from "./http";
import type { ILine } from "./interfaces";
import * as utils from "./utils";

interface LinesResponse {
  Status: { Code: string; Message?: string };
  Lines?: Array<{
    Name: string;
    Mot: string;
    Diva?: { Number: string; Network: string };
    Directions: Array<{ Name: string }>;
  }>;
}

/**
 * Get a list of available tram/bus lines for a stop.
 * @param stopID the stop ID
 * @param timeout the timeout of the request
 */
export async function lines(stopID: string, timeout = 15000): Promise<ILine[]> {
  const data = await post<LinesResponse>({
    url: "https://webapi.vvo-online.de/stt/lines",
    body: {
      format: "json",
      stopid: stopID,
    },
    timeout,
  });

  utils.checkStatus(data);

  if (!data.Lines) {
    return [];
  }

  return data.Lines.map((line) => ({
    name: line.Name,
    mode: utils.parseMode(line.Mot),
    diva: utils.parseDiva(line.Diva),
    directions: line.Directions.map((d) => d.Name),
  }));
}
