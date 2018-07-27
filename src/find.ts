import axios, { AxiosRequestConfig } from "axios";
import { IAddress, IPoint } from "./interfaces";
import * as utils from "./utils";

async function pointFinder(name: string, stopsOnly: boolean, assignedStops: boolean): Promise<IPoint[]> {
  if (typeof name !== "string") {
    throw utils.constructError("ValidationError", "query has to be a string");
  }

  const stopName = name.trim();

  const options: AxiosRequestConfig = {
    url: "https://webapi.vvo-online.de/tr/pointfinder",
    params: {
      format: "json",
      stopsOnly,
      assignedStops,
      limit: 0,
      query: stopName,
      dvb: true,
    },
  };

  return axios(options)
    .then((response) => {
      // check status of response
      utils.checkStatus(response.data);

      if (response.data.Points) {
        return response.data.Points.map((p: string) => {
          const poi = p.split("|");

          const city = poi[2] === "" ? "Dresden" : poi[2];
          const idAndType = utils.parsePoiID(poi[0]);
          const coords = utils.gk4toWgs84(poi[4], poi[5]);

          if (coords) {
            const point: IPoint = {
              city,
              coords,
              name: poi[3].replace(/'/g, ""),
              id: idAndType.id,
              type: idAndType.type,
            };
            return point;
          }
        }).filter((p: IPoint) => p && p.name);
      }

      return [];
    })
    .catch(utils.convertError);
}

export async function findStop(searchString: string) {
  return pointFinder(searchString, true, false);
}

export async function findPOI(searchString: string) {
  return pointFinder(searchString, false, false);
}

export async function findAddress(lat: number, lng: number) {

  const gk4 = utils.wgs84toGk4(lat, lng);

  return pointFinder(`coord:${gk4[0]}:${gk4[1]}`, false, true)
    .then((points) => {
      if (points.length === 0) {
        return undefined;
      }

      const address: IAddress = {
        ...points[0],
        stops: points.slice(1) || [],
      };

      return address;
    });
}
