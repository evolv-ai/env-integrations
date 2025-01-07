import json from '@rollup/plugin-json';
import minifyTaggedTemplates from './src/plugins/plugin-minify-templates.js';
import initWrap from './src/plugins/plugin-init-wrap.js';

export default [
  {
    input: `./src/intermediate/version.js`,
    output: {
      file: `./src/imports/version.js`
    },
    plugins: [json()]
  },
  {
    input: `./src/intermediate/init-contents.js`,
    output: {
      file: `./src/imports/init.js`,
      plugins: [initWrap()],
    },
    treeshake: false,
    preserveEntrySignatures: 'strict',
    plugins: [minifyTaggedTemplates({
      include: '**/*.js',
      tagNames: ['css', 'html', 'mixin'],
    })]
  },   
  {
    input: `./src/main.js`,
    output: {
      file: `./dist/es/index.js`,
      format: 'es',
      exports: 'auto',
    },
    preserveEntrySignatures: 'strict'
  },
  {
    input: `./src/main.js`,
    output: {
      file: `./dist/cjs/index.js`,
      format: 'cjs',
      exports: 'auto'
    },
    preserveEntrySignatures: 'strict'
  },
]
