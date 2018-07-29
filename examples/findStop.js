const dvb = require("dvbjs");

dvb.findStop("zellesch").then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
