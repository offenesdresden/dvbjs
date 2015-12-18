'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var find = function find(searchString, callback) {
    searchString = utils.stripSpaces(searchString);

    // for coordinates see this as well: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_AG_LINIEN_Schnittstelle_EFA_Koordinaten.pdf
    var options = {
        url: 'http://efa.vvo-online.de:8080/dvb/XML_STOPFINDER_REQUEST',
        qs: {
            locationServerActive: 1,
            outputFormat: 'JSON',
            type_sf: 'any',
            name_sf: searchString,
            coordOutputFormat: 'WGS84[DD.ddddd]',
            coordOutputFormatTail: 9
        }
    };

    return requestP(options)
        .then(JSON.parse)
        .then(function (data) {
            if (!data || !data.stopFinder || !data.stopFinder.points) {
                return [];
            }

            var points = data.stopFinder.points;
            if (!Array.isArray(points)) points = [points.point];
            return points.filter(utils.isDresden).map(utils.convertStop);
        }).nodeify(callback);
};

module.exports = find;
