const react = require('eslint-plugin-react');
const globals = require('globals');
const noInlineStyles = require('eslint-plugin-no-inline-styles');
const unusedClasses = require("eslint-plugin-mui-unused-classes");

module.exports = [
    {
        ignores: ["**/*/*copy*.js"],
    },
    {
        "settings": {
            "react": {
                "version": "detect",
            }
        },
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        plugins: {
            react,
            "no-inline-styles": noInlineStyles,
            "mui-unused-classes": unusedClasses
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            "max-len": [
                "error",
                {
                    "code": 120,
                    "ignoreStrings": true,
                    "ignoreTemplateLiterals": true,
                    "ignoreUrls": true,
                    "ignoreTrailingComments": true,
                    "ignoreRegExpLiterals": true
                }
            ],
            "indent": [
                "error",
                4,
                {
                    "SwitchCase": 1
                }
            ],
            "react/jsx-indent": [
                "error",
                4
            ],
            "react/prop-types": "off",
            "no-unused-vars": [
                "error",
                {
                    "vars": "all",
                    "args": "after-used",
                    "ignoreRestSiblings": false
                }
            ],
            "no-console": ["error"],
            "no-restricted-syntax": "off",
            "no-undef": "off",
            "react/prefer-stateless-function": "warn",
            "react/jsx-filename-extension": [
                "warn",
                {
                    "extensions": [".js", ".jsx"]
                }
            ],
            "max-params": [
                "error",
                7
            ],
            "semi": ["error", "always"],
            "prefer-destructuring": [
                "error",
                {
                    "array": true,
                    "object": true
                }
            ],
            "no-inline-styles/no-inline-styles": "warn",
            "mui-unused-classes/unused-classes": "warn"
        },
    },
];