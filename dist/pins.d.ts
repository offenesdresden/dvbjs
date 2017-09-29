/// <reference types="bluebird" />
import * as utils from './utils';
import bluebird = require('bluebird');
export declare function pins(swlat: number, swlng: number, nelat: number, nelng: number, pinType: PinType, callback?: (value: utils.Pin[], err?: Error) => void): bluebird<utils.Pin[]>;
export declare enum PinType {
    STOP = "stop",
    PLATFORM = "platform",
    POI = "poi",
    RENT_A_BIKE = "rentabike",
    TICKET_MACHINE = "ticketmachine",
    CAR_SHARING = "carsharing",
    PARK_AND_RIDE = "parkandride",
}
