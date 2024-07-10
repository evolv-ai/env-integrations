import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.raw.js',
      format: 'es',
    },
    plugins: [json()],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
    },
    plugins: [
      json(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-private-methods'],
        targets: {
          esmodules: true,
          browsers: 'defaults',
        },
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.min.js',
      format: 'cjs',
    },
    plugins: [
      json(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-private-methods'],
        targets: {
          esmodules: true,
          browsers: 'defaults',
        },
      }),
      terser(),
    ],
  },
];
