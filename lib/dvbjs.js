var request = require('request');

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

    module.route = function(origin, destination, time, callback) {

        origin = origin.replace(/ /g, '');
        destination  = destination.replace(/ /g, '');

        var year   = time.getFullYear();
        var month  = time.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day    = time.getDate();
        var hour   = time.getHours();
        var minute = time.getMinutes();

        // API docs: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_LINIEN_Schnittstelle_EFA_V1.pdf
        // found here -> http://www.nise81.com/archives/2674
        var url = 'http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2?sessionID=0&requestID=0&language=de&execInst=normal&command=&ptOptionsActive=-1&itOptionsActive=&itDateDay=' + day + '&itDateMonth=' + month + '&itDateYear=' + year + '&place_origin=Dresden&placeState_origin=empty&type_origin=stop&name_origin=' + origin + '&nameState_origin=empty&place_destination=Dresden&placeState_destination=empty&type_destination=stop&name_destination=' + destination + '&nameState_destination=empty&itdTripDateTimeDepArr=dep&itdTimeHour=' + hour + '&idtTimeMinute=' + minute + '&outputFormat=JSON';
        request(url, function(err, res, data){
            data = JSON.parse(data);

            var json = {origin: data.origin.points.point.name, destination: data.destination.points.point.name, trips: []};

            for (var i = 0; i < data.trips.length; i++) {
                var departure = data.trips[i].legs[0].points[0].dateTime.time;
                var arrival = data.trips[i].legs[data.trips[i].legs.length - 1].points[data.trips[i].legs[data.trips[i].legs.length - 1].points.length - 1].dateTime.time; // are you freakin' kidding me?!

                var duration = data.trips[i].duration;
                var interchange = data.trips[i].interchange;

                json.trips.push({departure: departure, arrival: arrival, duration: duration, interchange: interchange, nodes: []});

                for (var j = 0; j < data.trips[i].legs.length; j++) {
                    json.trips.nodes.push({test: 'test'});
                    // same problem as before, check: http://stackoverflow.com/questions/12487999/how-to-use-push-with-sub-arrays
                    // and maybe try and imagine what a good data model would look like here
                }
            }

            console.log(json);
        });
    };

    module.find = function(searchString, callback) {

        searchString = searchString.replace(/ /g, '');

        var url = 'http://efa.vvo-online.de:8080/dvb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=' + searchString;

        request(url, function(err, res, data){
            data = JSON.parse(data);

            var json = {stop: data.stopFinder.points.point.object, coords: data.stopFinder.points.point.ref.coords};

            callback(json);
        });

    };

    return module;
};
