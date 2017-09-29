import * as requestP from 'request-promise';
import * as utils from './utils';
import bluebird = require('bluebird');
import { IMonitor } from './interfaces';

export function monitor(stopID: string, offset: number, amount: number,
                        callback?: (value: IMonitor, err?: Error) => void): bluebird<IMonitor> {

  const now = new Date();
  let time = now;
  if (offset && offset !== 0) {
    time = new Date(now.getTime() + (offset * 60 * 1000));
  }

  const options = {
    url: 'https://webapi.vvo-online.de/dm?format=json',
    qs: {
      stopid: stopID,
      time: time.toISOString(),
      isarrival: false,
      limit: amount,
      shorttermchanges: true,
      mentzonly: false,
    },
    json: true,
  };

  return requestP(options)
    .then((data) => {
      // check status of response
      utils.checkStatus(data);

      if (data.Departures) {
        return data.Departures.map((d: any) => {
          const arrivalTime = utils.parseDate(d.RealTime ? d.RealTime : d.ScheduledTime);
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
            state: d.State ? d.State : 'Unknown',
            mode: utils.parseMode(d.Mot),
            diva: utils.parseDiva(d.Diva),
          };
        });
      }

      return [];
    })
    .catch(utils.convertError)
    .nodeify(callback);
}

function dateDifference(start: Date, end: Date): number {
  return Math.round((end.getDate() - start.getDate()) / 1000 / 60);
}
