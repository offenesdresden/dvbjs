## dvbjs

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop information.

Require the module to get started.
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

Query the server for possible routes from one stop to another. Returns multiple possible routes, the single stops on each of these and some other info.

```js
var origin = "Helmholtzstraße";
var destination  = "Zellescher Weg";
var time = new Date();
var deparr = 0; // set to 0 for the time to be the departure time, 1 for arrival time

dvb.route(origin, destination, time, deparr, function(data){
    console.log(data);
});
```

```
this is still work in progress...
```

### Find stops

Search for a single stop in the network of the DVB. Returns an array of all possible hits including their GPS coordinates.

```js
dvb.find('zellesch', function(data){
    console.log(data);
});
```

```js
{
    results: [{
        stop: 'Zellescher Weg',
        coords: '4622580.00000,503749.00000'
    }]
}
```

By the way, stop names in queries are very forgiving. As long as the server sees it as a unique hit, it'll work. 'Helmholtzstraße' finds the same data as 'helmholtzstrasse', 'Nürnberger Platz' = 'nuernbergerplatz' etc.

One last note, be sure not to run whatever it is your building from inside the network of the TU Dresden (at least as far as I can tell). Calls to everything but `dvb.monitor()` will time out. If I could tell you why their site won't give me much info from inside eduroam I would.
