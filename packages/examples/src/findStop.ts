import * as dvb from "dvbjs"; // OR const dvb = require("dvbjs");

dvb.findStop("zellesch").then((data) => {
  console.dir({ data }, { depth: 7, maxArrayLength: 2 });
});
