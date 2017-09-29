/// <reference types="bluebird" />
import { IPin, PIN_TYPE } from './interfaces';
import bluebird = require('bluebird');
export declare function pins(swlat: number, swlng: number, nelat: number, nelng: number, pinType: PIN_TYPE, callback?: (value: IPin[], err?: Error) => void): bluebird<IPin[]>;
