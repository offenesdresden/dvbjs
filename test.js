var dvb = require('./index');

dvb.monitor('postplatz', 0, 5)
    .then(function (data) {
        console.log(JSON.stringify(data, 4, 4));
    });