const fs = require("fs");
const path = require("path");
const markdownMagic = require("markdown-magic");

const config = {
  transforms: {
    RENDERDOCS(_, options) {
      const lines = fs
        .readFileSync(options.path, { encoding: "UTF8" })
        .split("\n");

      const interfaces = {};

      for (let line of lines) {
        const match = line.match(/\* \[(.*)\]\[(InterfaceDeclaration-.*)\]/);
        if (match) {
          interfaces[match[1]] = `[${match[1]}][${match[2]}]`;
        }
        if (line.startsWith("##")) {
          break;
        }
      }

      const interfaceRegExp = `.*(${Object.keys(interfaces).join(
        "|"
      )}) &#124; undefined.*`;

      let isCode = false;

      return lines
        .map((line) => {
          if (line.startsWith("#")) return `##${line}`;
          if (line.startsWith("|")) {
            const match = line.match(interfaceRegExp);
            if (match) {
              const interface = match[1];
              line = line.replace(interface, interfaces[interface]);
            }
            line = line.replace("&#124; undefined", "");
          } else if (line === "```typescript") {
            isCode = true;
          } else if (line === "```") {
            isCode = false;
          } else if (isCode) {
            line = line.replace(" | undefined", "");
          }
          return line;
        })
        .join("\n")
        .replace(/index.md/g, "README.md");
    },
    EXAMPLE_CODE(_, options) {
      return [
        "```ts",
        ...fs
          .readFileSync(options.src, { encoding: "UTF8" })
          .trim()
          .split("\n"),
        "```",
      ].join("\n");
    },
  },
};

const markdownPath = path.join(__dirname, "README.md");
markdownMagic(markdownPath, config);
