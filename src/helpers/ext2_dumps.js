#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const createCommand = require("./create_command");

module.exports = ext2Dumps;

if (module === require.main) {
  if (process.argv.length === 3) {
    ext2Dumps(path.resolve(process.argv[2]));
  } else {
    console.log("usage: %s <path to images folder>", process.argv[1]);
  }
}

async function ext2Dumps(folder) {
  const ext2Dump = createCommand(path.resolve(__dirname, "../bin/ext2_dump"));

  const images = fs
    .readdirSync(folder)
    .filter(file => file.endsWith(".img"))
    .map(file => path.resolve(folder, file));

  const dumpResults = await Promise.all(images.map(file => ext2Dump(file)));

  dumpResults.map((result, i) => {
    const file = images[i];
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    fs.writeFileSync(file.replace(/\.img$/, ".txt"), result.stdout);
  });
}
