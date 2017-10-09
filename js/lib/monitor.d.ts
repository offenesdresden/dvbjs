/// <reference types="bluebird" />
import { IMonitor } from './interfaces';
import bluebird = require('bluebird');
export declare function monitor(stopID: string, offset?: number, amount?: number, callback?: (error: Error, value?: IMonitor) => void): bluebird<IMonitor[]>;
