import json from '@rollup/plugin-json'
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

function buildFile(src){
  return  [   
    {
      input: `./src/index.js`,
      output: {
        file: `./dist/index.js`,
        format: 'iife'
      },
      plugins: [
        resolve(),
        commonJS({
          include: 'node_modules/**'
        })
      ]
    }
  ]
}

export default buildFile()
