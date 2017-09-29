/// <reference types="bluebird" />
import { IRoute } from './interfaces';
import bluebird = require('bluebird');
export declare function route(originID: string, destinationID: string, time: Date, isArrivalTime: boolean, callback?: (value: IRoute, err?: Error) => void): bluebird<IRoute>;
