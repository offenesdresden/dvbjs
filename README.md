## dvbjs

**WIP**: Not finished at this point! This will be updated when it is.

---

A node module giving you a few options to query the servers of the [DVB](http://dvb.de) for current bus- and tramstop data.

All you need to do is

```
var dvb = require('dvbjs');
````

and then call 

```
var results = '';
dvb.single("Helmholtzstraße",2,function(data){results = data;});
```

where you can substitute 'Helmholtzstraße' with any stop you'd like and 2 with the amount of results.

Calling ```console.log(results)``` would output the following.

```
[ [ '85', 'Striesen', '4' ], 
[ '85', 'Löbtau Süd', '4' ] ]
```
[ 'name of the bus/tramline' , 'direction' , 'when it will arrive' ]
