'use strict';

var request = require('request');
var utils = require('./utils');

var find = function find(searchString, callback) {

    searchString = utils.stripSpaces(searchString);

    // for coordinates see this as well: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_AG_LINIEN_Schnittstelle_EFA_Koordinaten.pdf
    var url = 'http://efa.vvo-online.de:8080/dvb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=' + searchString + '&coordOutputFormat=WGS84&coordOutputFormatTail=0';

    request.get(url, function onResponse(err, res, data) {
        if (err) return callback(err);

        try {
            var points = JSON.parse(data).stopFinder.points;
        } catch (e) {
            return callback(err);
        }

        if (!Array.isArray(points)) {
            points = [ points.point ];
        }

        var result = points.filter(utils.isDresden).map(utils.convertStop);

        callback(null, result);
    });

};

module.exports = find;
