import * as requestP from 'request-promise';
import { Promise } from 'bluebird';
import * as utils from './utils';
import bluebird = require('bluebird');
import { IAddress, IPoint } from './interfaces';

function pointFinder(name: string, stopsOnly: boolean, assignedStops: boolean): bluebird<IPoint[]> {
  if (typeof name !== 'string') {
    return Promise.reject(utils.constructError('ValidationError', 'query has to be a string'));
  }

  const stopName = name.trim();

  const options = {
    url: 'https://webapi.vvo-online.de/tr/pointfinder?format=json',
    qs: {
      stopsOnly,
      assignedStops,
      limit: 0,
      query: stopName,
      dvb: true,
    },
    json: true,
  };

  return requestP(options)
    .then((data) => {
      // check status of response
      utils.checkStatus(data);

      if (data.Points) {
        return data.Points.map((p: string) => {
          const poi = p.split('|');

          const city = poi[2] === '' ? 'Dresden' : poi[2];
          const idAndType = utils.parsePoiID(poi[0]);

          return {
            city,
            name: poi[3].replace(/'/g, ''),
            id: idAndType.id,
            coords: utils.gk4toWgs84(poi[4], poi[5]),
            type: idAndType.type,
          };
        }).filter((p: IPoint) => p.name);
      }

      return [];
    })
    .catch(utils.convertError);
}

export function findStop(searchString: string,
                         callback?: (value: IPoint[], err?: Error) => void): bluebird<IPoint[]> {

  return pointFinder(searchString, true, false).asCallback(callback);
}

export function findPOI(searchString: string,
                        callback?: (value: IPoint[], err?: Error) => void): bluebird<IPoint[]> {

  return pointFinder(searchString, false, false).asCallback(callback);
}

export function findAddress(lat: number, lng: number,
                            callback?: (value: IPoint[], err?: Error) => void): bluebird<IAddress> {

  const gk4 = utils.wgs84toGk4(lat, lng);

  return pointFinder(`coord:${gk4[0]}:${gk4[1]}`, false, true)
    .then((points) => {
      if (points.length === 0) {
        return null;
      }

      const address: IAddress = points[0];
      address.stops = points.slice(1);

      return address;
    }).nodeify(callback);
}
