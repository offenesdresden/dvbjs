/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export declare function coords(id: number, callback?: (value: utils.coord, error?: Error) => void): bluebird<number[]>;
