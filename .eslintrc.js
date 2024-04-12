module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "overrides": [
    {
      "env": {
        "jest": true,
      },
      "files": [
        "**/*.spec.js",
      ],
    },
    {
      "extends": [
        "plugin:@typescript-eslint/recommended",
      ],
      "files": [
        '**/*.ts'
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.eslint.json",
        "sourceType": "module"
      },
      "plugins": [
        "@typescript-eslint"
      ],
      "rules": {
        "@typescript-eslint/await-thenable": "error",
      }
    },
    {
      "plugins": [
          "json"
      ],
      "files": [
        "*.json",
      ],
      "rules": {
          "json/*": ["error"]
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
      project: ["tsconfig.json"],
  },
  "plugins": [
      "eslint-plugin-prefer-arrow",
  ],
  "rules": {}
};
