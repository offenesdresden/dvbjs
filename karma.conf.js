module.exports = function (config) {
    config.set({
        frameworks: ["mocha", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" }
        ],
        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },
        reporters: ["mocha", "karma-typescript"],
        browsers: ["Chrome"],
        karmaTypescriptConfig: {
            compilerOptions: {
                target: "ES5",
                lib: ["es2015", "dom"],
                sourceMap: true,
            },
            tsconfig: "tsconfig.json",
            reports: {
                text: "",
                lcovonly: {
                    directory: "coverage",
                    filename: "lcov.info",
                    subdirectory: "/"
                },
            }
        },
        singleRun: true
    });
};
