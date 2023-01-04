import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';

export default [
    {
        input: 'src/index.js',
        output: {
            dir: 'dist',
            format: 'es',
        },
        plugins: [
            babel({
                plugins: ['@babel/plugin-transform-async-to-generator'],
                babelHelpers: 'bundled',
            }),
            json(),
        ],
    },
    {
        input: 'src/index-local.js',
        output: {
            file: 'serve/catalyst-local.js',
            // format: 'iife',
        },
        plugins: [json()],
    },
];
