import * as requestP from 'request-promise';
import * as utils from './utils';
import bluebird = require('bluebird');
import { coord } from './interfaces';

export function coords(id: number,
                       callback?: (value: coord, error?: Error) => void): bluebird<number[]> {

  const options = {
    url: 'https://www.dvb.de/apps/map/coordinates',
    qs: {
      id,
    },
  };

  return requestP(options)
    .then((data: string) => {
      if (data.length < 3) {
        return null;
      }

      const coords = data.slice(1, data.length - 1).split('|');

      return utils.gk4toWgs84(coords[0], coords[1]);
    }).nodeify(callback);
}
