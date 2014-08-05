## dvbjs

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

There's two functions available, `dvb.monitor()` and `dvb.route()`. Monitor is used to monitor a single stop as it returns every bus and tram leaving there in a specified time. The route function takes two stops and returns possible routes between these two.

**Important: Apparently the data acquired by `dvb.route()` is not allowed to be gathered in this form. I am therefore not publishing this module through npm and am merely documenting *how* one could work with this data. You are not to use this for any actual applications.**
`dvb.monitor()` *should* be exempt from this.

#### Monitor a single stop

```js
var dvb = require('dvbjs');

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

#### Find routes

```js
var dvb = require('dvbjs');

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

By the way, stop names are very forgiving. 'Helmholtzstraße' is the same as 'helmholtzstrasse', 'Nürnberger Platz' = 'nuernbergerplatz' etc.

One last note, be sure not to run whatever it is your building from inside the network of the TU Dresden (at least as far as I can tell). Calls to `dvb.route()` will time out. If I could tell you why their site won't give me much info from inside eduroam I would.
