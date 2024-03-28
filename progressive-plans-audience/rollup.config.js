import json from '@rollup/plugin-json'
// import resolve from 'rollup-plugin-node-resolve';

export default [   
  {
    input: `./src/index.js`,
    output: {
      file: `./dist/es/index.js`,
      format: 'es',
      exports: 'auto'
    },
    plugins: [json()]
  },
  {
    input: `./src/index.js`,
    output: {
      file: `./dist/cjs/index.js`,
      format: 'cjs',
      exports: 'auto'
    },
    plugins: [json()]
  },
]
