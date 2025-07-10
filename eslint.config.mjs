import globals from 'globals';
import pluginJs from '@eslint/js';


export default [
   {
      languageOptions: { globals: globals.browser },
      rules: {
         'quotes': ['error', 'single', 'avoid-escape'],
         'indent': ['error', 3],
      },
   },
   pluginJs.configs.recommended,
];