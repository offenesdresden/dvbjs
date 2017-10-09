/// <reference types="bluebird" />
import { IAddress, IPoint } from './interfaces';
import bluebird = require('bluebird');
export declare function findStop(searchString: string, callback?: (error: Error, value?: IPoint[]) => void): bluebird<IPoint[]>;
export declare function findPOI(searchString: string, callback?: (error: Error, value?: IPoint[]) => void): bluebird<IPoint[]>;
export declare function findAddress(lat: number, lng: number, callback?: (error: Error, value?: IAddress) => void): bluebird<IAddress>;
