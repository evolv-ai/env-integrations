import terser from "@rollup/plugin-terser";
import json from '@rollup/plugin-json';

export default {
  input: "src/index.js", // Entry point
  output: {
    file: "dist/index.js", // Output must be index.js
    format: "esm", // Use ES Modules for browsers
    sourcemap: false
  },
  plugins: [
    terser(),
    json()
  ]
};