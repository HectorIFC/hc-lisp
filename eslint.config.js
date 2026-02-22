const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

const disallowComments = {
    create(context) {
        return {
            Program() {
                const comments = context.sourceCode.getAllComments();
                comments.forEach(comment => {
                    context.report({ node: comment, message: 'Comments are not allowed.' });
                });
            }
        };
    }
};

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
            'local': { rules: { 'disallow-comments': disallowComments } }
        },
        rules: {
            'no-console': 'off',
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'max-len': ['error', { code: 140 }],
            'no-empty': 'off',
            'no-shadow': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'curly': 'error',
            'eol-last': 'error',
            'indent': ['error', 2],
            'no-trailing-spaces': 'error',
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'space-before-blocks': 'error',
            'keyword-spacing': 'error',
            'space-infix-ops': 'error',
            'comma-spacing': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'no-undef': 'off',
            'local/disallow-comments': 'error'
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
