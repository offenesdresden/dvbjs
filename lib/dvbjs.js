var request = require('request');
var cheerio = require('cheerio');

module.exports = function() {

    module.monitor = function(stop,offset,amount,callback){

        // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
        stop = stop.replace(/ /g, '');

        // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
        // vz = time offset from now; trims the beginning of the array
        // lim = limit the amount of results, max seems to be 31
        var url = 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=' + offset + '&lim=' + amount;

        request(url, function(err, res, data){
            if (err) throw err;

            data = JSON.parse(data);
            var json = [];
            for (var i = 0; i < data.length; i++) {
                json.push({line: data[i][0], direction: data[i][1], arrivaltime: data[i][2]});
            }

            callback(json);
        });
    };

    // Since the DVB only allows access to their API via reverse proxy, we're
    // gonna have to scrape this stuff from their site \o/
    module.route = function(start, stop, time, callback) {

        var url = 'http://www.dvb.de/de/Fahrplan/Verbindungsauskunft/direkt.do?vaform%5Bstarttypeswitch_stop%5D=1&vaform%5Bzieltypeswitch_stop%5D=1&vaform%5Bstartort%5D=Dresden&vaform%5Bstartname%5D=' + start + '&vaform%5Bzielort%5D=Dresden&vaform%5Bzielname%5D=' + stop + '&vaform%5Bzeittyp%5D=dep&vaform%5Bdatum%5D=' + '23.07.2014' + '&vaform%5Bzeit%5D=' + '19.03';
        console.log(url);
    };

    return module;
};
