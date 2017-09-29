import * as requestP from 'request-promise';
import * as utils from './utils';
import bluebird = require('bluebird');
import { ILine } from './interfaces';


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

export function lines(stopID: string,
                      callback?: (value: ILine, error?: Error) => void): bluebird<ILine> {

  const options = {
    url: 'https://webapi.vvo-online.de/stt/lines?format=json',
    qs: {
      stopid: stopID,
    },
    json: true,
  };

  return requestP(options)
    .then((data) => {
      // check status of response
      utils.checkStatus(data);

      if (data.Lines) {
        return data.Lines.map(parseLine);
      }

      return [];
    })
    .catch(utils.convertError)
    .nodeify(callback);
}
