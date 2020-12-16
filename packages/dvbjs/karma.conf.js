module.exports = function (config) {
  config.set({
    frameworks: ["mocha", "karma-typescript"],
    files: [{ pattern: "{src,test}/**/*.ts" }],
    preprocessors: {
      "**/*.ts": ["karma-typescript"],
    },
    reporters: ["mocha", "karma-typescript"],
    browsers: ["ChromeHeadless"],
    client: {
      mocha: {
        timeout: 6000,
        opts: ".mocharc.json",
      },
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        target: "ES5",
        lib: ["es2015", "dom"],
        sourceMap: true,
      },
      tsconfig: "tsconfig.json",
      coverageOptions: {
        exclude: /(\.(d|spec|test)\.ts|test\/helper.ts)$/i,
      },
      reports: {
        text: "",
        lcovonly: {
          directory: "coverage",
          filename: "lcov.info",
          subdirectory: "/",
        },
      },
    },
    singleRun: true,
  });
};
