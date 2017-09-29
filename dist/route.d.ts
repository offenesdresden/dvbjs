/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export interface Location {
    name: string;
    city: string;
    coords: utils.coord;
}
export interface Stop extends Location {
    type: string;
    platform: utils.Platform;
    arrival: Date;
    departure: Date;
}
export interface StopLocation extends Location {
    platform: utils.Platform;
    time: Date;
    type: string;
}
export interface Node {
    stops: Stop[];
    departure: StopLocation;
    arrival: StopLocation;
    mode: utils.Mode;
    line: string;
    direction: string;
    diva: utils.Diva;
    duration: number;
    path: utils.coord[];
}
export interface Trip {
    departure: StopLocation;
    arrival: StopLocation;
    duration: number;
    interchanges: number;
    nodes: Node[];
}
export interface Route {
    origin: Location | undefined;
    destination: Location | undefined;
    trips: Trip[];
}
export declare function route(originID: string, destinationID: string, time: Date, isArrivalTime: boolean, callback?: (value: Route, err?: Error) => void): bluebird<Route>;
