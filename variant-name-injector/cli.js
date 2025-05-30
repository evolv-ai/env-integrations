#!/usr/bin/env node

const path = require('path');
const lib = require('./index') ;

const fullPath = path.resolve();
const currentFolder = fullPath.match(/([^\/]*)\/*$/)[0];
const inputName = path.resolve(`../${currentFolder}.yml`);
const outputName = path.resolve(`../${currentFolder}.out.yml`);

lib.processYaml(
  process.argv[2] || inputName, 
  process.argv[3] || outputName
);
