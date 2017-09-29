/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { coord } from './interfaces';
export declare function coords(id: number, callback?: (value: coord, error?: Error) => void): bluebird<number[]>;
