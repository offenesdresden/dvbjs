exports.monitor = function(stop,amount,callback){

	// remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
	stop = stop.replace(/ /g, '');

	// hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
	// vz = time offset from now; trims the beginning of the array
	// lim = limit the amount of results, max is 31
	var options = {
		host: 'widgets.vvo-online.de',
		path: '/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=0&lim=' + amount
	};

	fetchResult = function(options,callback){
		var http = require('http');
		var str = '';

		http.get(options,function(res){

			// another chunk of data has been received, append to data
			res.on('data',function(chunk){
				str += chunk;
			});

			// entire response has been received
			res.on('end',function(){
				callback(JSON.parse(str));
			});

		}).on('error', function(e){
			callback(e.message);
		});
	}

	fetchResult(options,function(data){
		callback(data);
	});
}
