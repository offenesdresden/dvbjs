export enum POI_TYPE {
  Address = "Address",
  Coords = "Coords",
  POI = "POI",
  Stop = "Stop",
}

export enum PIN_TYPE {
  stop = "stop",
  platform = "platform",
  poi = "poi",
  rentabike = "rentabike",
  ticketmachine = "ticketmachine",
  carsharing = "carsharing",
  parkandride = "parkandride",
  unknown = "unknown",
}

/**
 * WGS84 coordinates [lng, lat]
 */
export type coord = [number, number];

export interface Diva {
  number: number;
  network?: string;
}

export interface Platform {
  name: string;
  type: string;
}
/**
 * - The id for PIN_TYPE.platform is always an empty string.
 * - PIN_TYPE.platform conatins platform_nr.
 * - PIN_TYPE.stop contains connections.
 * - PIN_TYPE.parkandride contains info.
 */
export interface Pin {
  id: string;
  type: PIN_TYPE;
  name: string;
  coords: coord;
  platformNr?: string;
  connections?: Connection[];
  info?: string;
}

export interface Connection {
  line: string;
  mode?: Mode;
}

export interface Mode {
  title: string;
  name: string;
  iconUrl?: string;
}

export interface Address extends Point {
  stops: Point[];
}

export interface Line {
  name: string;
  mode?: Mode;
  diva?: Diva;
  directions: string[];
}

export interface Monitor {
  arrivalTime: Date;
  scheduledTime: Date;
  id: string;
  line: string;
  direction: string;
  platform?: Platform;
  arrivalTimeRelative: number;
  scheduledTimeRelative: number;
  delayTime: number;
  state: string;
  mode?: Mode;
  diva?: Diva;
}
export interface Location {
  id: string;
  name: string;
  city: string;
  coords: coord;
}

export interface Point extends Location {
  type: POI_TYPE;
}

export interface Stop extends Location {
  type: string;
  platform?: Platform;
  arrival: Date;
  departure: Date;
  dhid: string;
}

export interface StopLocation extends Location {
  platform?: Platform;
  time: Date;
  type: string;
}

export interface Node {
  stops: Stop[];
  departure?: StopLocation;
  arrival?: StopLocation;
  mode?: Mode;
  line: string;
  direction: string;
  diva?: Diva;
  dlid?: string;
  duration: number;
  path: coord[];
}

export interface Trip {
  departure?: StopLocation;
  arrival?: StopLocation;
  duration: number;
  interchanges: number;
  nodes: Node[];
}

export interface Route {
  origin?: Location;
  destination?: Location;
  trips: Trip[];
}
