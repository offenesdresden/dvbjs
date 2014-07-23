var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
var Zombie = require("zombie");

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

        var browser = new Zombie({
            debug: true,
            runScripts: false,
            loadCSS: false,
            userAgent: 'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0'
        });

        browser.visit('http://www.dvb.de/de/Fahrplan/Verbindungsauskunft/index.aspx', function(){
            browser
                .fill('vaform[startname]', start)
                .fill('vaform[zielname]', stop)
                .pressButton('#va_form.input.button[value="Suchen"]', function() {
                    console.log(browser.text("title"));
                });
        });
    };

    return module;
};
