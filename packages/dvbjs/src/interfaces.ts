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
export type coord = number[];

export interface IDiva {
  number: number;
  network?: string;
}

export interface IPlatform {
  name: string;
  type: string;
}
/**
 * - The id for PIN_TYPE.platform is always an empty string.
 * - PIN_TYPE.platform conatins platform_nr.
 * - PIN_TYPE.stop contains connections.
 * - PIN_TYPE.parkandride contains info.
 */
export interface IPin {
  id: string;
  type: PIN_TYPE;
  name: string;
  coords: coord;
  platform_nr?: string;
  connections?: IConnection[];
  info?: string;
}

export interface IConnection {
  line: string;
  mode: IMode;
}

export interface IMode {
  title: string;
  name: string;
  icon_url?: string;
}

export interface IAddress extends IPoint {
  stops: IPoint[];
}

export interface ILine {
  name: string;
  mode: IMode;
  diva?: IDiva;
  directions: string[];
}

export interface IMonitor {
  arrivalTime: Date;
  scheduledTime: Date;
  id: string;
  line: string;
  direction: string;
  platform?: IPlatform;
  arrivalTimeRelative: number;
  scheduledTimeRelative: number;
  delayTime: number;
  state: string;
  mode: IMode;
  diva?: IDiva;
}
export interface ILocation {
  id: string;
  name: string;
  city: string;
  coords: coord;
}

export interface IPoint extends ILocation {
  type: POI_TYPE;
}

export interface IStop extends ILocation {
  type: string;
  platform?: IPlatform;
  arrival: Date;
  departure: Date;
}

export interface IStopLocation extends ILocation {
  platform?: IPlatform;
  time: Date;
  type: string;
}

export interface INode {
  stops: IStop[];
  departure?: IStopLocation;
  arrival?: IStopLocation;
  mode: IMode;
  line: string;
  direction: string;
  diva?: IDiva;
  duration: number;
  path: coord[];
}

export interface ITrip {
  departure?: IStopLocation;
  arrival?: IStopLocation;
  duration: number;
  interchanges: number;
  nodes: INode[];
}

export interface IRoute {
  origin?: ILocation;
  destination?: ILocation;
  trips: ITrip[];
}
