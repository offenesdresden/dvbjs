const fs = require("fs");
const path = require("path");
const markdownMagic = require("markdown-magic");

const config = {
  transforms: {
    RENDERDOCS(_, options) {
      return fs
        .readFileSync(options.path, { encoding: "UTF8" })
        .split("\n")
        .map(line => {
          if (line.startsWith("#")) return `##${line}`;
          return line;
        })
        .join("\n")
        .replace(/index.md/g, "README.md");
    }
  }
};

const markdownPath = path.join(__dirname, "README.md");
markdownMagic(markdownPath, config);
