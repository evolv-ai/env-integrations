import json from '@rollup/plugin-json';

function buildFile(src){
  return  [   
    {
      input: `./src/index.js`,
      output: {
        file: `./dist/index.js`,
      },
      plugins: [
      ]
    },
    {
      input: `./test/harness.js`,
      output: {
        file: `./dist/harness.js`,
        format: 'iife'
      },
      plugins: [
          json()
      ]
    },
  ]
}

export default buildFile()

