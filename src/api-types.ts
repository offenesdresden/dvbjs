/**
 * Raw API response types for the VVO WebAPI.
 * These are internal types — not exported from the public API.
 */

export interface ApiStatus {
  Code: string;
  Message?: string;
}

export interface ApiDiva {
  Number: string;
  Network: string;
}

export interface ApiPlatform {
  Name: string;
  Type: string;
}

// Departure Monitor (POST /dm)

export interface ApiDeparture {
  Id: string;
  LineName: string;
  Direction: string;
  Platform?: ApiPlatform;
  Mot: string;
  RealTime?: string;
  ScheduledTime: string;
  State?: string;
  Diva?: ApiDiva;
}

export interface DepartureMonitorResponse {
  Name: string;
  Place: string;
  Status: ApiStatus;
  Departures?: ApiDeparture[];
}

// Trips (POST /tr/trips)

export interface ApiMot {
  Type?: string;
  Name?: string;
  Direction?: string;
  DlId?: string;
  Diva?: ApiDiva;
}

export interface ApiRegularStop {
  DataId: string;
  DhId: string;
  Name: string;
  Place: string;
  Type: string;
  Platform?: ApiPlatform;
  Latitude: number;
  Longitude: number;
  ArrivalTime: string;
  DepartureTime: string;
}

export interface ApiPartialRoute {
  Duration: number;
  MapDataIndex: number;
  Mot: ApiMot;
  RegularStops?: ApiRegularStop[];
}

export interface ApiRoute {
  RouteId: number;
  Duration: number;
  Interchanges: number;
  PartialRoutes: ApiPartialRoute[];
  MapData: string[];
}

export interface TripsResponse {
  Status: ApiStatus;
  Routes?: ApiRoute[];
}

// Lines (POST /stt/lines)

export interface ApiLine {
  Name: string;
  Mot: string;
  Diva?: ApiDiva;
  Directions: Array<{ Name: string }>;
}

export interface LinesResponse {
  Status: ApiStatus;
  Lines?: ApiLine[];
}

// PointFinder (GET /tr/pointfinder)

export interface PointFinderResponse {
  PointStatus: string;
  Status: ApiStatus;
  Points?: string[];
}

// Pins (POST /map/pins)

export interface PinsResponse {
  Status?: ApiStatus;
  Pins?: string[];
}
