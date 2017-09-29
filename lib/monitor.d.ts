/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { IMonitor } from './interfaces';
export declare function monitor(stopID: string, offset: number, amount: number, callback?: (value: IMonitor, err?: Error) => void): bluebird<IMonitor>;
