## dvbjs

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

There's two functions available, `dvb.monitor()` and `dvb.route()`. Monitor is used to monitor a single stop as it returns every bus and tram leaving there in a specified time. The route function takes two stops and returns possible routes between these two. As the *official* API only allows access via a reverse proxy, this actually goes ahead and scrapes their site, which makes it a little slow, but it should work just fine. They'll probably block you for a shitload of requests though, so use with caution.

You can download and mark it as a dependency in your package.json with npm.
```bash
$ npm install --save dvbjs
```

Here's two minimal examples.

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

var start = "Helmholtzstraße";
var stop  = "Zellescher Weg";
var time = ; // not sure yet

dvb.route(start, stop, time, function(data){
    console.log(data);
});

```

By the way, stop names are very forgiving. 'Helmholtzstraße' is the same as 'helmholtzstrasse', 'Nürnberger Platz' = 'nuernbergerplatz' etc.
