import json from '@rollup/plugin-json'
// import resolve from 'rollup-plugin-node-resolve';

export default [   
  {
    input: `./src/index.js`,
    output: {
      file: `./dist/index.js`,
      format: 'es',
      exports: 'auto'
    },
    plugins: [json()]
  },
]
