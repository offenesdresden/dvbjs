## dvbjs

![travis-ci](http://img.shields.io/travis/kiliankoe/dvbjs.svg?style=flat)

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop information.

Install and require the module to get started.
```sh
$ npm install dvbjs
```

```js
var dvb = require('dvbjs');
```

### Monitor a single stop

Monitor a single stop to see every bus or tram leaving this stop after the specified time offset.

```js
var stopName = "Helmholtzstraße";
var timeOffset = 0; // how many minutes in the future, 0 for now
var numResults = 2;

dvb.monitor(stopName, timeOffset, numResults, function(data){
    console.log(data);
});
```

```js
[{
    line: "85",
    direction: "Striesen",
    arrivaltime: "4"
},
{
    line: "85",
    direction: "Löbtau Süd",
    arrivaltime: "4"
}]
```

### Find routes

Query the server for possible routes from one stop to another. Returns multiple possible trips, the bus-/tramlines to be taken, the single stops, their arrival and departure times and their GPS coordinates.

```js
var origin = "Helmholtzstraße";
var destination  = "Zellescher Weg";
var time = new Date();
var deparr = 0; // set to 0 for the time to be the departure time, 1 for arrival time

dvb.route(origin, destination, time, deparr, function(data){
    console.log(data);
});
```

```js
{
    "origin": "Dresden, Helmholtzstraße",
    "destination": "Dresden, Zellescher Weg",
    "trips": [{
        "departure": "13:34",
        "arrival": "13:56",
        "duration": "00:22",
        "interchange": "2",
        "nodes": [{
            "mode": "Stadtbus",
            "line": "85",
            "direction": "DD Löbtau Süd Mohorner Str.",
            "departure": {
                "stop": "Helmholtzstraße",
                "time": "13:34",
                "coords": "4621158.00000,504097.00000"
            },
            "arrival": {
                "stop": "Plauen Nöthnitzer Straße",
                "time": "13:36",
                "coords": "4620527.00000,503940.00000"
            }
        }, {...}, {...}]
    }, {
        "departure": "14:02",
        "arrival": "14:11",
        "duration": "00:09",
        "interchange": "1",
        "nodes": [{...}, {...}]
    }, {...}, {...}]
}
```

A note: A simple console.log of the returned data will look slightly different as js objects will only be displayed as `Object` at a certain depth. They're still there though. Use `console.log(JSON.stringify(data, null, 4));` for example to view it in your console.

### Find stops

Search for a single stop in the network of the DVB. Returns an array of all possible hits including their GPS coordinates.

```js
dvb.find('zellesch', function(data){
    console.log(data);
});
```

```js
[{
    stop: 'Zellescher Weg',
    coords: '4622580.00000,503749.00000'
}]
```

By the way, stop names in queries are very forgiving. As long as the server sees it as a unique hit, it'll work. 'Helmholtzstraße' finds the same data as 'helmholtzstrasse', 'Nürnberger Platz' = 'nuernbergerplatz' etc.

One last note, be sure not to run whatever it is your building from inside the network of the TU Dresden (at least as far as I can tell). Calls to everything but `dvb.monitor()` will time out. If I could tell you why their site won't give me much info from inside eduroam I would.
