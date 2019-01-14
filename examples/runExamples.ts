import { writeFileSync } from "fs";
import { basename, join } from "path";
import { inspect } from "util";

const EXAMPLES = ["findStop", "monitor", "route"];

EXAMPLES.forEach(async (example) => {
  console.dir = (data: any, options: any) => {
    const filename = _getCallerFile();
    if (!filename) {
      throw new Error("no filename in stacktrace");
    }

    writeFileSync(
      join(__dirname, `${basename(filename)}.yml`),
      inspect(data, options),
      {
        encoding: "utf-8",
      }
    );
  };
  require(`./${example}`);
});

function _getCallerFile(): string | undefined {
  let filename: string | undefined;
  const prepareStackTraceOrg = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = (_, structuredStackTrace) => {
      return structuredStackTrace[2].getFileName();
    };
    filename = new Error().stack;
    // tslint:disable-next-line:no-empty
  } catch (e) {}

  Error.prepareStackTrace = prepareStackTraceOrg;
  return filename;
}
