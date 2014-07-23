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
    module.route = function(start, stop, date, time, callback) {

        start = start.replace(/ /g, '');
        stop = stop.replace(/ /g, '');
        time = time.replace(':','.');

        var url = 'http://www.dvb.de/de/Fahrplan/Verbindungsauskunft/direkt.do?vaform%5Bstarttypeswitch_stop%5D=1&vaform%5Bzieltypeswitch_stop%5D=1&vaform%5Bstartort%5D=Dresden&vaform%5Bstartname%5D=' + start + '&vaform%5Bzielort%5D=Dresden&vaform%5Bzielname%5D=' + stop + '&vaform%5Bzeittyp%5D=dep&vaform%5Bdatum%5D=' + date + '&vaform%5Bzeit%5D=' + time;
        // console.log(url);
        request(url, function(err, res, html){
            if (err) throw err;

            var $ = cheerio.load(html);

            var json = [];

            $('#verbindungen_container').filter(function(){
                var data = $(this);

                //TODO: Loop through this... somehow?!
                var trip1 = data.find('tr.hr').children().first();
                var departure = trip1.next().text();
                var arrival = trip1.nextAll().slice(1,2).text();
                var duration = trip1.nextAll().slice(2,3).text();
                var transfers = trip1.nextAll().slice(3,4).text();

                json.push({departure: departure, arrival: arrival, duration: duration, transfers: transfers, details: []});

                var trip2 = data.find('tr.hr').next().children().first();
                departure = trip2.next().text();
                arrival = trip2.nextAll().slice(1,2).text();
                duration = trip2.nextAll().slice(2,3).text();
                transfers = trip2.nextAll().slice(3,4).text();

                json.push({departure: departure, arrival: arrival, duration: duration, transfers: transfers, details: []});

                var trip3 = data.find('tr.hr').nextAll().slice(1,2).children().first();
                departure = trip3.next().text();
                arrival = trip3.nextAll().slice(1,2).text();
                duration = trip3.nextAll().slice(2,3).text();
                transfers = trip3.nextAll().slice(3,4).text();

                json.push({departure: departure, arrival: arrival, duration: duration, transfers: transfers, details: []});

                var trip4 = data.find('tr.hr').nextAll().slice(2,3).children().first();
                departure = trip4.next().text();
                arrival = trip4.nextAll().slice(1,2).text();
                duration = trip4.nextAll().slice(2,3).text();
                transfers = trip4.nextAll().slice(3,4).text();

                json.push({departure: departure, arrival: arrival, duration: duration, transfers: transfers, details: []});
            });

            $('#va-selected-trips-actions').filter(function(){
                var data = $(this);

                var trip1_content = data.next().find('tbody').children().first().children().first().text();
                console.log(trip1_content);
            });

        });
    };

    return module;
};
