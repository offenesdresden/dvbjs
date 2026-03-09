import { post } from "./http";
import { type IPin, PIN_TYPE } from "./interfaces";
import * as utils from "./utils";

// Map our PIN_TYPE enum values to the WebAPI pintypes values
const PIN_TYPE_TO_API: Record<PIN_TYPE, string> = {
  [PIN_TYPE.stop]: "Stop",
  [PIN_TYPE.platform]: "Platform",
  [PIN_TYPE.poi]: "Poi",
  [PIN_TYPE.rentabike]: "RentABike",
  [PIN_TYPE.ticketmachine]: "TicketMachine",
  [PIN_TYPE.carsharing]: "CarSharing",
  [PIN_TYPE.parkandride]: "ParkAndRide",
  [PIN_TYPE.unknown]: "",
};

interface PinsResponse {
  Status?: { Code: string; Message?: string };
  Pins?: string[];
}

/**
 * Search for different kinds of POIs inside a given bounding box.
 * @param swlng the longitude of the south west coordinate
 * @param swlat the latitude of the south west coordinate
 * @param nelng the longitude of the north east coordinate
 * @param nelat the latitude of the north east coordinate
 * @param pinTypes array of pin types
 * @param timeout the timeout of the request
 */
export async function pins(
  swlng: number,
  swlat: number,
  nelng: number,
  nelat: number,
  pinTypes: PIN_TYPE[] = [PIN_TYPE.stop],
  timeout = 15000,
): Promise<IPin[]> {
  const sw = utils.WGS84toGK4(swlng, swlat);
  const ne = utils.WGS84toGK4(nelng, nelat);

  const data = await post<PinsResponse>({
    url: "https://webapi.vvo-online.de/map/pins",
    body: {
      swlat: String(sw[1]),
      swlng: String(sw[0]),
      nelat: String(ne[1]),
      nelng: String(ne[0]),
      pintypes: pinTypes.map((t) => PIN_TYPE_TO_API[t]).filter(Boolean),
      format: "json",
    },
    timeout,
  });

  const elements = data.Pins || [];
  return elements.map((elem) => utils.parsePin(elem));
}
