const fs = require("fs");
const path = require("path");

fs.copyFileSync("README.md", path.join("packages", "dvbjs", "README.md"));
