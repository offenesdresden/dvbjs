import * as dvb from "../src/index";

dvb.findStop("zellesch").then((data) => {
  console.dir({ data }, { depth: 7, maxArrayLength: 2 });
});
