/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { IAddress, IPoint } from './interfaces';
export declare function findStop(searchString: string, callback?: (value: IPoint[], err?: Error) => void): bluebird<IPoint[]>;
export declare function findPOI(searchString: string, callback?: (value: IPoint[], err?: Error) => void): bluebird<IPoint[]>;
export declare function findAddress(lat: number, lng: number, callback?: (value: IPoint[], err?: Error) => void): bluebird<IAddress>;
