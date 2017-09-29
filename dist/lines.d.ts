/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export interface Line {
    name: string;
    mode: utils.Mode;
    diva: utils.Diva;
    directions: string[];
}
export declare function lines(stopID: string, callback?: (value: Line, error?: Error) => void): bluebird<Line>;
