/** Utility function to create a K:V from a list of strings */
function strEnum<T extends string>(o: T[]): {[K in T]: K} {
  return o.reduce(
    (res, key) => {
      res[key] = key;
      return res;
    },
    Object.create(null));
}

export const POI_TYPE = strEnum([
  "Address",
  "Coords",
  "POI",
  "Stop",
]);

export type POI_TYPE = keyof typeof POI_TYPE;

export const PIN_TYPE = strEnum([
  "stop",
  "platform",
  "poi",
  "rentabike",
  "ticketmachine",
  "carsharing",
  "parkandride",
]);

export type PIN_TYPE = keyof typeof PIN_TYPE;

export type coord = number[];

export interface IDiva {
  number: number;
  network: string;
}

export interface IPlatform {
  name: string;
  type: string;
}

export interface IPin {
  id: string;
  type: PIN_TYPE;
  name: string;
  coords: coord;
  platform_nr?: string;
  connections?: IConnection[];
}

export interface IConnection {
  line: string;
  type: string;
}

export interface IMode {
  title: string;
  name: string;
  icon_url?: string;
}

export interface IPoint {
  city: string;
  name: string;
  id: string;
  coords: coord;
  type: POI_TYPE;
}

export interface IAddress extends IPoint {
  stops?: IPoint[];
}

export interface ILine {
  name: string;
  mode: IMode;
  diva: IDiva;
  directions: string[];
}

export interface IMonitor {
  arrivalTime: Date;
  scheduledTime: Date;
  id: string;
  line: string;
  direction: string;
  platform: IPlatform;
  arrivalTimeRelative: number;
  scheduledTimeRelative: number;
  delayTime: number;
  state: string;
  mode: IMode;
  diva: IDiva;
}

export interface ILocation {
  name: string;
  city: string;
  coords: coord;
}

export interface IStop extends ILocation {
  type: string;
  platform: IPlatform;
  arrival: Date;
  departure: Date;
}

export interface IStopLocation extends ILocation {
  platform: IPlatform;
  time: Date;
  type: string;
}

export interface INode {
  stops: IStop[];
  departure: IStopLocation;
  arrival: IStopLocation;
  mode: IMode;
  line: string;
  direction: string;
  diva: IDiva;
  duration: number;
  path: coord[];
}

export interface ITrip {
  departure: IStopLocation;
  arrival: IStopLocation;
  duration: number;
  interchanges: number;
  nodes: INode[];
}

export interface IRoute {
  origin: ILocation | undefined;
  destination: ILocation | undefined;
  trips: ITrip[];
}
