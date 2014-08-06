## dvbjs

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

There's a few methods available:
- `dvb.monitor()`

 This is used to monitor a single stop as it returns every bus and tram leaving there in a specified time.
    
- `dvb.route()`

 Takes two stops and returns possible routes between these two.
    
- `dvb.find()`

 Uses a searchstring to find stops in Dresden.

Require the module to get started.
```js
var dvb = require('dvbjs');
```

### Monitor a single stop

```js
var stopName = "Helmholtzstraße";
var timeOffset = 0; // how many minutes in the future, 0 for now
var numResults = 2;

dvb.monitor(stopName, timeOffset, numResults, function(data){
    console.log(data);
});
```

Output is of the following form.

```json
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

```js
var origin = "Helmholtzstraße";
var destination  = "Zellescher Weg";
var time = new Date(); // returns current data

dvb.route(origin, destination, time, function(data){
    console.log(data);
});
```

```
this is still work in progress...
```

### Find stops

```js
dvb.find('zellesch', function(data){
    console.log(data);
});
```

```json
{ results: [{
    stop: 'Zellescher Weg',
    coords: '4622580.00000,503749.00000'
}]}
```

By the way, stop names in queries are very forgiving. As long as the server sees it as a unique hit, it'll work. 'Helmholtzstraße' finds the same data as 'helmholtzstrasse', 'Nürnberger Platz' = 'nuernbergerplatz' etc.

One last note, be sure not to run whatever it is your building from inside the network of the TU Dresden (at least as far as I can tell). Calls to everything but `dvb.monitor()` will time out. If I could tell you why their site won't give me much info from inside eduroam I would.
