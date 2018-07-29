const dvb = require("dvbjs");

const stopID = "33000037"; // Postplatz
var timeOffset = 5;
var numResults = 2;

dvb.monitor(stopID, timeOffset, numResults).then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
