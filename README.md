## dvbjs

**WIP**: Only single stop queries at this point, route calculation is hopefully possible soon. Still awaiting a call back (pun intended) regarding their API specification.

---

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

All you need to do is

```js
var dvb = require('dvbjs')();

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

```
[ 'name of the bus/tramline' , 'direction' , 'when it will arrive' ]
```
Stop names are very forgiving. Helmholtzstraße = helmholtzstrasse, Nürnberger Platz = nuernbergerplatz etc.
