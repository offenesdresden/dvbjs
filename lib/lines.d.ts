/// <reference types="bluebird" />
import bluebird = require('bluebird');
import { ILine } from './interfaces';
export declare function lines(stopID: string, callback?: (value: ILine, error?: Error) => void): bluebird<ILine>;
