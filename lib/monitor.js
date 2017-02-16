'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

function pointFinder(name, callback) {

    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    var stopName = utils.stripSpaces(name);

    var options = {
      url: 'https://webapi.vvo-online.de/tr/pointfinder?format=json',
      qs: {
        limit: 0,
        query: stopName,
        stopsOnly: true,
        dvb: true,
        assignedStops: true
      }
    }

    return requestP(options).then(function(response) {
      var data = JSON.parse(response);

      // check status
      if(data.Status !== 'undefined' &&
         data.Status.Code === 'Ok'&&
         data.Points !== 'undefined') {

        for(var i=0; i < data.Points.length; i++) {
          var p = data.Points[i].split('|');

          // only and empty city string points to
          // DVB (Dresden) stops
          if(p[2].length === 0 || p[2] === 'Dresden') {
            var stopid = p[0];

            if(typeof(callback) === 'function')
              callback(stopid);

            break;
          }
        }
      }
    });
}

function depatureMonitor(stopid, offset, amount, callback) {

    var now = new Date();
    var time = now;
    if(offset !== 'undefined' && offset !== 0)
      time = new Date(now.getTime() + (offset * 60 * 1000));

    var options = {
      url: 'https://webapi.vvo-online.de/dm?format=json',
      qs: {
        stopid: stopid,
        time: time.toISOString(),
        isarrival: false,
        limit: amount,
        shorttermchanges: true,
        mentzonly: false
      }
    }

    return requestP(options).then(function(response) {
      var data = JSON.parse(response);
      var departures = [];

      // check status
      if(data.Status !== 'undefined' &&
         data.Status.Code === 'Ok'&&
         data.Departures !== 'undefined') {

         for(var i=0; i < data.Departures.length; i++) {
           var d = data.Departures[i];

           var arrivalTime;
           if(d.RealTime)
             arrivalTime = new Date(parseInt(d.RealTime.substr(6)));
           else
             arrivalTime = new Date(parseInt(d.ScheduledTime.substr(6)));

           var arrivalTimeRelative = Math.round((arrivalTime - now) / 1000 / 60);

           var scheduledTime = new Date(parseInt(d.ScheduledTime.substr(6)));
           var scheduledTimeRelative = Math.round((scheduledTime - now) / 1000 / 60);

           var platform;
           if(d.Platform)
             platform = { name: d.Platform.Name, type: d.Platform.Type };

           departures.push({
             line: d.LineName,
             direction: d.Direction,
             platform: platform,
             arrivalTime: arrivalTime,
             arrivalTimeRelative: arrivalTimeRelative,
             scheduledTime: scheduledTime,
             scheduledTimeRelative: scheduledTimeRelative,
             delayTime: Math.round((arrivalTime - scheduledTime) / 1000 / 60),
             state: d.State ? d.State : 'Unknown',
             mode: utils.parseMode(d.Mot)
           });
         }

         return departures;
      }
    }).nodeify(callback);
}

var monitor = function monitor(stop, offset, amount, callback) {

    if(typeof(stop) === 'string') {
      pointFinder(utils.stripSpaces(stop), function(stopid) {
        return depatureMonitor(stopid, offset, amount, callback);
      });
    } else
      return depatureMonitor(stop, offset, amount, callback);
};

module.exports = monitor;
