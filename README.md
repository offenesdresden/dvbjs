## dvbjs

[![travis-ci](http://img.shields.io/travis/kiliankoe/dvbjs.svg?style=flat)](https://travis-ci.org/kiliankoe/dvbjs)
[![npmversion](http://img.shields.io/npm/v/dvbjs.svg?style=flat)](https://www.npmjs.org/package/dvbjs)

This is an unofficial node module, giving you a few options to query Dresden's public transport system for current bus- and tramstop data.

In case you're looking for something like this for Python, check out [dvbpy](https://github.com/kiliankoe/dvbpy).

### Getting Started

Install the module using npm
```sh
$ npm install dvbjs
```

and require it in your project
```js
var dvb = require('dvbjs');
```

### Monitor a single stop

Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.

Example:
```js
var stopName = 'Helmholtzstraße'; // name of the stop
var timeOffset = 0; // how many minutes in the future, 0 for now
var numResults = 2; // number of results

dvb.monitor(stopName, timeOffset, numResults, function(err, data) {
    if (err) throw err;
    console.log(JSON.stringify(data, null, 4));
});
```
Output:
```js
[{
    line: '85',
    direction: 'Striesen',
    arrivaltime: 14
}, {
    line: '85',
    direction: 'Löbtau Süd',
    arrivaltime: 20
}]
```

### Find routes

Query the server for possible routes from one stop to another. Returns multiple possible trips, the bus-/tramlines to be taken, the single stops, their arrival and departure times and their GPS coordinates.

Example:
```js
var origin = 'Helmholtzstraße';
var destination = 'Zellescher Weg';
var time = new Date(); // starting at what time
var deparr = dvb.route.DEPARTURE; // set to dvb.route.DEPARTURE for the time to be the departure time, dvb.route.ARRIVAL for arrival time

dvb.route(origin, destination, time, deparr, function(err, data) {
    if (err) throw err;
    console.log(JSON.stringify(data, null, 4));
});
```
Output:
```js
{
    "origin": "Dresden, Helmholtzstraße",
    "destination": "Dresden, Zellescher Weg",
    "trips": [{
        "departure": "13:34",
        "arrival": "13:56",
        "duration": "00:22",
        "interchange": 2,
        "nodes": [{
            "mode": "Stadtbus",
            "line": "85",
            "direction": "DD Löbtau Süd Mohorner Str.",
            "departure": {
                "stop": "Helmholtzstraße",
                "time": "13:34",
                "coords": [ 51.025549, 13.725457 ]
            },
            "arrival": {
                "stop": "Plauen Nöthnitzer Straße",
                "time": "13:36",
                "coords": [ 51.027625, 13.715769 ]
            },
            "path": [[ 51.02554, 13.725471 ],[ 51.02557, 13.725286 ], ...]
        },
        {...}
        ]
    }, {
        "departure": "14:02",
        "arrival": "14:11",
        "duration": "00:09",
        "interchange": 1,
        "nodes": [...]
    },
    {...}
    ]
}
```

The path property contains an array consisting of all the coordinates describing the path of this node. This can be useful to draw the route on a map.

### Find stops

Search for a single stop in the network of the DVB. Returns an array of all possible hits including their GPS coordinates.

Example:
```js
dvb.find('zellesch', function(err, data){
    if (err) throw err;
    console.log(JSON.stringify(data, null, 4));
});
```
Output:
```js
[{
    stop: 'Zellescher Weg',
    coords: [51.028366, 13.745847]
}]
```

### Misc

By the way, stop names in queries are very forgiving. As long as the server sees it as an unique hit, it'll work. 'Helmholtzstraße' finds the same data as 'helmholtzstrasse', 'Nürnberger Platz' as 'nuernbergerplatz' etc.

One last note, be sure not to run whatever it is you're building from inside the network of the TU Dresden (at least as far as I can tell). Calls to everything but `dvb.monitor()` will time out. If I could tell you why their site won't give me much info from inside eduroam, I would.
