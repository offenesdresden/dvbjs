import * as requestP from 'request-promise';
import * as utils from './utils';
import { IPin, PIN_TYPE } from './interfaces';
import bluebird = require('bluebird');

export function pins(swlat: number, swlng: number, nelat: number, nelng: number,
                     pinType: PIN_TYPE,
                     callback?: (error: Error, value?: IPin[]) => void): bluebird<IPin[]> {

  const sw = utils.wgs84toGk4(swlat, swlng);
  const ne = utils.wgs84toGk4(nelat, nelng);

  const options = {
    url: 'https://www.dvb.de/apps/map/pins',
    qs: {
      showLines: 'true',
      swlat: sw[1],
      swlng: sw[0],
      nelat: ne[1],
      nelng: ne[0],
      pintypes: pinType,
    },
  };

  return requestP(options)
    .then((data: string) => {
      if (!data) {
        return [];
      }
      // Create an array out of the string response by splitting between each: ","
      // Drop the first two characters: " and [
      // and the last last two characters: ] and "
      return data.slice(2, data.length - 2).split('","');
    })
    .map((elem: string) => utils.parsePin(elem, pinType)).nodeify(callback);
}
