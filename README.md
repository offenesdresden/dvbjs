## dvbjs

**WIP**: Only single stop queries at this point, route calculation is hopefully possible soon. Still awaiting a call back (pun intended) regarding their API specification.

---

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

All you need to do is

```
var dvb = require('dvbjs');
````

and then call 

```
var stopName = "Helmholtzstraße";
var numResults = 2;

dvb.monitor(stopName,numResults,function(data){
console.log(data);
});
```

Output is an array of the following form:

```
[ [ '85', 'Striesen', '4' ], 
[ '85', 'Löbtau Süd', '4' ] ]
```

```
[ 'name of the bus/tramline' , 'direction' , 'when it will arrive' ]
```
Stop names are very forgiving. Helmholtzstraße = helmholtzstrasse, Nürnberger Platz = nuernbergerplatz etc.
