module.exports = {
root: true,
extends: [
'@react-native',
'eslint:recommended',
'plugin:react/recommended',
'plugin:react-hooks/recommended',
'plugin:prettier/recommended',
],
parser: '@babel/eslint-parser',
parserOptions: {
ecmaFeatures: {
    jsx: true,
},
ecmaVersion: 2020,
sourceType: 'module',
},
plugins: ['react', 'react-hooks', 'prettier'],
rules: {
'prettier/prettier': 'error',
'react/react-in-jsx-scope': 'off',
'react/prop-types': 'off',
'no-console': ['warn', { allow: ['warn', 'error'] }],
'react-hooks/rules-of-hooks': 'error',
'react-hooks/exhaustive-deps': 'warn',
},
settings: {
react: {
    version: 'detect',
},
},
env: {
'react-native/react-native': true,
es6: true,
node: true,
},
}; 