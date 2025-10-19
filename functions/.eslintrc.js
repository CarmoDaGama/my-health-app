module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": "off",
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["warn", {"code": 120}],
    "@typescript-eslint/no-explicit-any": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "no-trailing-spaces": "warn",
    "padded-blocks": "off",
    "prefer-const": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
