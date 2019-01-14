import * as dvb from "../src/index";

const origin = "33000742"; // Helmholtzstraße
const destination = "33000037"; // Postplatz
const startTime = new Date();

dvb.route(origin, destination, startTime).then((data) => {
  console.dir(data, { depth: 7, maxArrayLength: 2 });
});
