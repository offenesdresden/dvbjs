import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

const stopID = "33000037"; // Postplatz
const timeOffset = 5;
const numResults = 2;

dvb.monitor(stopID, timeOffset, numResults).then((data) => {
  console.dir(data, { depth: 7, maxArrayLength: 2 });
});
