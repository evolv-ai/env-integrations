import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.js',
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [json()],
  },
  {
    input: 'src/index-local.js',
    output: {
      file: 'serve/catalyst-local.js',
      format: 'iife',
    },
    plugins: [json()],
  },
];
