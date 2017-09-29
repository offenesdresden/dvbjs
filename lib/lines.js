"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestP = require("request-promise");
var utils = require("./utils");
function parseDirection(direction) {
    return direction.Name;
}
function parseLine(line) {
    return {
        name: line.Name,
        mode: utils.parseMode(line.Mot),
        diva: utils.parseDiva(line.Diva),
        directions: line.Directions.map(parseDirection),
    };
}
function lines(stopID, callback) {
    var options = {
        url: 'https://webapi.vvo-online.de/stt/lines?format=json',
        qs: {
            stopid: stopID,
        },
        json: true,
    };
    return requestP(options)
        .then(function (data) {
        // check status of response
        utils.checkStatus(data);
        if (data.Lines) {
            return data.Lines.map(parseLine);
        }
        return [];
    })
        .catch(utils.convertError)
        .nodeify(callback);
}
exports.lines = lines;
//# sourceMappingURL=lines.js.map