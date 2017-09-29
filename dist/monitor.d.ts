/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export interface Monitor {
    arrivalTime: Date;
    scheduledTime: Date;
    id: string;
    line: string;
    direction: string;
    platform: utils.Platform;
    arrivalTimeRelative: number;
    scheduledTimeRelative: number;
    delayTime: number;
    state: string;
    mode: utils.Mode;
    diva: utils.Diva;
}
export declare function monitor(stopID: string, offset: number, amount: number, callback?: (value: Monitor, err?: Error) => void): bluebird<Monitor>;
