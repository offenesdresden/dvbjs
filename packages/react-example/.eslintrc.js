module.exports = {
  extends: [
    "../../.eslintrc.js", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:react/recommended",
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "@typescript-eslint/explicit-function-return-type": 0,
    "react/prop-types": 0,
    "no-console": 0,
  },
};
