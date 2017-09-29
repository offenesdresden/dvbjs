/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export interface Point {
    city: string;
    name: string;
    id: string;
    coords: utils.coord;
    type: string;
}
export interface Address extends Point {
    stops?: Point[];
}
export declare function findStop(searchString: string, callback?: (value: Point[], err?: Error) => void): bluebird<Point[]>;
export declare function findPOI(searchString: string, callback?: (value: Point[], err?: Error) => void): bluebird<Point[]>;
export declare function findAddress(lat: number, lng: number, callback?: (value: Point[], err?: Error) => void): bluebird<Address>;
