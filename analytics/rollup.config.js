import json from '@rollup/plugin-json'


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
      input: `./test/testConfig.js`,
      output: {
        file: `./dist/testConfig.js`,
      },
      plugins: [
        json()
      ]
    },
  ]
}

export default buildFile()

