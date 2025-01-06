export default function initWrap() {
  return {
    name: 'init-wrap',
    generateBundle(outputOptions, bundle, isWrite) {
      const source = bundle['init.js'].code;
      bundle['init.js'].code = `export default function init() {${source}}`;
    }
  }
}