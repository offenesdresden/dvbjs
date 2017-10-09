/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { coord } from './interfaces';
export declare function coords(id: string, callback?: (error: Error, value?: coord) => void): bluebird<number[]>;
