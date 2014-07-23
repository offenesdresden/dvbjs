var request = require('request');
var cheerio = require('cheerio');

module.exports = function() {

    module.monitor = function(stop,amount,callback){

        // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
        stop = stop.replace(/ /g, '');

        // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
        // vz = time offset from now; trims the beginning of the array
        // lim = limit the amount of results, max is 31
        var url = 'http://widgets.vvo-online.de' + '/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=0&lim=' + amount;

        request(url, function(err, res, data){
            if (err) throw err;

            callback(data);
        });
    };

