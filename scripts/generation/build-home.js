#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..');

async function main(args) {
  const check = args.length === 1 && args[0] === '--check';
  const custom = args.length === 2 && args[0] === '--output';
  if (args.length && !check && !custom) throw new Error('Usage: build-home.js [--check | --output FILE]');
  const output = custom ? path.resolve(args[1]) : path.join(root, 'js/home-cosmos.bundle.js');
  const result = await esbuild.build({
    absWorkingDir: root,
    entryPoints: ['js/home-cosmos.js'],
    outfile: 'js/home-cosmos.bundle.js',
    bundle: true,
    format: 'esm',
    target: 'es2020',
    minify: true,
    keepNames: true,
    legalComments: 'inline',
    charset: 'utf8',
    write: false,
    metafile: true,
    logLevel: 'silent',
  });
  const bytes = Buffer.from(result.outputFiles[0].contents);
  if (check) {
    if (!fs.existsSync(output) || !fs.readFileSync(output).equals(bytes)) {
      throw new Error('Home bundle is stale. Run npm run build:assets and include the generated asset.');
    }
  } else {
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, bytes);
  }
  const inputBytes = Object.values(result.metafile.inputs).reduce((sum, file) => sum + file.bytes, 0);
  console.log(JSON.stringify({checked: check, inputBytes, outputBytes: bytes.length}));
}

if (require.main === module) main(process.argv.slice(2)).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
module.exports = {main};
