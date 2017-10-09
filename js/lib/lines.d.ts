/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { ILine } from './interfaces';
export declare function lines(stopID: string, callback?: (error: Error, value?: ILine[]) => void): bluebird<ILine[]>;
