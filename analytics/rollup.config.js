// import copy from 'rollup-plugin-copy'


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
      ]
    },
  ]
}

export default buildFile()

