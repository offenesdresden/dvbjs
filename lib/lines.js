'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var lines = function lines(stopID, callback) {
    var options = {
        url: 'https://webapi.vvo-online.de/stt/lines?format=json',
        qs: {
            stopid: stopID
        },
        json: true
    };

    return requestP(options)
        .then(function (data) {
            if (data.Status &&
                data.Status.Code === 'Ok' &&
                data.Lines) {

                return data.Lines.map(parseLine);
            }

            return [];

        })
        .nodeify(callback);
};

function parseLine(line) {
    return {
        name: line.Name,
        mode: utils.parseMot(line.Mot),
        diva: utils.parseDiva(line.Diva),
        directions: line.Directions.map(parseDirection)
    }
}

function parseDirection(direction) {
    return direction.Name;
}

module.exports = lines;
