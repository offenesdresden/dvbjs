"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestP = require("request-promise");
var utils = require("./utils");
function coords(id, callback) {
    var options = {
        url: 'https://www.dvb.de/apps/map/coordinates',
        qs: {
            id: id,
        },
    };
    return requestP(options)
        .then(function (data) {
        if (data.length < 3) {
            return null;
        }
        var coords = data.slice(1, data.length - 1).split('|');
        return utils.gk4toWgs84(coords[0], coords[1]);
    }).nodeify(callback);
}
exports.coords = coords;
//# sourceMappingURL=coords.js.map