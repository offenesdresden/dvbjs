module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  rules: {
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/no-explicit-any": 0,
    curly: ["error", "all"],
    "no-console": ["error", { allow: ["error"] }],
  },
};
