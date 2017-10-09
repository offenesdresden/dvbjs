/// <reference types="bluebird" />
import { IRoute } from './interfaces';
import bluebird = require('bluebird');
export declare function route(originID: string, destinationID: string, time?: Date, isArrivalTime?: boolean, callback?: (error: Error, value?: IRoute) => void): bluebird<IRoute>;
