"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Utility function to create a K:V from a list of strings */
function strEnum(o) {
    return o.reduce(function (res, key) {
        res[key] = key;
        return res;
    }, Object.create(null));
}
exports.POI_TYPE = strEnum([
    'Address',
    'Coords',
    'POI',
    'Stop',
]);
exports.PIN_TYPE = strEnum([
    'stop',
    'platform',
    'poi',
    'rentabike',
    'ticketmachine',
    'carsharing',
    'parkandride',
]);
//# sourceMappingURL=interfaces.js.map