const dvb = require("dvbjs");

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
var startTime = new Date();

dvb.route(origin, destination, startTime).then(function (data) {
    console.log(JSON.stringify(data, null, 4));
})
