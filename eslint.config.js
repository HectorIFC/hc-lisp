const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const noComments = require('eslint-plugin-no-comments');

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                global: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript,
            'no-comments': noComments
        },
        rules: {
            // Disable console warnings (equivalent to tslint no-console: false)
            'no-console': 'off',
            
            // Quotes (equivalent to tslint quotemark: single)
            'quotes': ['error', 'single'],
            
            // Semicolons (equivalent to tslint semicolon: always)
            'semi': ['error', 'always'],
            
            // No trailing comma (equivalent to tslint trailing-comma: never)
            'comma-dangle': ['error', 'never'],
            
            // Max line length (equivalent to tslint max-line-length: 140)
            'max-len': ['error', { code: 140 }],
            
            // Allow empty blocks (equivalent to tslint no-empty: false)
            'no-empty': 'off',
            
            // Allow variable shadowing (equivalent to tslint no-shadowed-variable: false)
            'no-shadow': 'off',
            
            // Prefer const (equivalent to tslint prefer-const: true)
            'prefer-const': 'error',
            
            // No var keyword (equivalent to tslint no-var-keyword: true)
            'no-var': 'error',
            
            // Require curly braces (equivalent to tslint curly: true)
            'curly': 'error',
            
            // End of line (equivalent to tslint eofline: true)
            'eol-last': 'error',
            
            // Indentation with 2 spaces
            'indent': ['error', 2],
            
            // No trailing whitespace (equivalent to tslint no-trailing-whitespace: true)
            'no-trailing-spaces': 'error',
            
            // Brace style (equivalent to tslint one-line)
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            
            // Space before blocks (equivalent to tslint whitespace)
            'space-before-blocks': 'error',
            'keyword-spacing': 'error',
            'space-infix-ops': 'error',
            'comma-spacing': 'error',
            
            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            
            // Allow undef since TypeScript handles this
            'no-undef': 'off',
            
            // Disable all comments using plugin (but allow shebangs)
            // Disable all comments using plugin
            'no-comments/disallowComments': 'error'
        }
    },
    // Special rules for CLI executables (allow shebangs)
    {
        files: ['**/hc-runner.ts', '**/repl.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                global: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript
        },
        rules: {
            // All TypeScript rules from main config
            'no-console': 'off',
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'max-len': ['error', { code: 140 }],
            'no-empty': 'off',
            'no-shadow': 'off',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/prefer-as-const': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'no-undef': 'off'
            // Note: No comment restrictions for CLI files (allows shebangs)
        }
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            'coverage/',
            '*.js',
            '!eslint.config.js'
        ]
    }
];
