export enum POI_TYPE {
  ADDRESS = <any>'Address',
  COORDS = <any>'Coords',
  POI = <any>'POI',
  STOP = <any>'Stop',
}

export enum PIN_TYPE {
  STOP = <any>'stop',
  PLATFORM = <any>'platform',
  POI = <any>'poi',
  RENT_A_BIKE = <any>'rentabike',
  TICKET_MACHINE = <any>'ticketmachine',
  CAR_SHARING = <any>'carsharing',
  PARK_AND_RIDE = <any>'parkandride',
}

export type coord = number[];

export interface IDiva {
  number: number;
  network: string;
}

export interface IPlatform {
  name: string;
  type: String;
}

export interface IPin {
  id?: string;
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
  type: string;
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

export interface Node {
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

export interface Trip {
  departure: IStopLocation;
  arrival: IStopLocation;
  duration: number;
  interchanges: number;
  nodes: Node[];
}

export interface IRoute {
  origin: ILocation | undefined;
  destination: ILocation | undefined;
  trips: Trip[];
}
