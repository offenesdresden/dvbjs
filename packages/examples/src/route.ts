import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
const startTime = new Date();

dvb.route(origin, destination, startTime, false).then((data) => {
  console.dir(data, { depth: 7, maxArrayLength: 2 });
});
