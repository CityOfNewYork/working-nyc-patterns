#!/usr/bin/env node

'use strict'

/**
 * Dependencies
 */

const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');

/**
 * Config file for this script
 */

const config = require(`${process.env.PWD}/config/feather`);

/**
 * @pttrn Dependencies
 */

const pttrn = `${process.env.PWD}/node_modules/@nycopportunity/pttrn`;
const alerts = require(`${pttrn}/config/alerts`);
const cnsl = require(`${pttrn}/bin/util/console`);

/**
 * Constants
 */

const SRC = config.src;
const DIST = config.dist;
const EXT = config.ext;
const PREFIX = config.prefix;

/**
 * Our SVG Sprite
 */

let SPRITE = new svgstore();

/**
 * Write file to the distribution folder
 *
 * @param  {String}     file  The file source
 * @param  {Object}     data  The data to pass to the file
 *
 * @return {Undefined}        The result of fs.writeFileSync()
 */
const write = async (file, data) => {
  try {
    if (!fs.existsSync(path.dirname(file))) {
      fs.mkdirSync(path.dirname(file), {recursive: true});
    }

    let written = fs.writeFileSync(file, data);

    cnsl.describe(`${alerts.success} Feather sprite written to ${alerts.str.path(file)}`);

    return written;
  } catch (err) {
    cnsl.error(`Feather failed (write): ${err.stack}`);
  }
}

/**
 * Add a file and it's data to the store
 *
 * @param  {String}  file  The filename of the svg
 * @param  {String}  data  The raw contents of the file
 *
 * @return {Object}        The svg sprite
 */
const store = async (file, data) => {
  try {
    let name = path.basename(file).replace(path.extname(file), '');

    SPRITE.add(`${PREFIX}${name}`, data);

    return SPRITE;
  } catch (err) {
    cnsl.error(`Feather failed (store): ${err.stack}`);
  }
};

/**
 * The main task bus for transforming contents of a source file
 *
 * @param  {String}  file  Path to source file
 *
 * @return {String}        Transformed data
 */
const main = async (file) => {
  try {
    let data = await fs.readFileSync(file, 'utf-8');

    await store(file, data);

    return data;
  } catch (err) {
    cnsl.error(`Feather failed (main): ${err.stack}`);
  }
};

/**
 * Read a specific file, if it is a directory read all of the files in it,
 * then, perform the main task on the file.
 *
 * @param {String}  file  A single file or directory to recursively walk
 */
const walk = async (file) => {
  if (file.includes(EXT)) {
    await main(path.join(SRC, file));
  } else {
    try {
      let files = fs.readdirSync(file, 'utf-8');

      for (let i = files.length - 1; i >= 0; i--) {
        await walk(files[i], file);
      }
    } catch (err) {
      cnsl.error(`Feather failed (walk): ${err.stack}`);
    }
  }
};

/**
 * Runner for the sample script. If the -w or --watch flag is passed it will
 * run the watcher method. If a single filename is passed it will run the
 * main task on the file.
 *
 * @type {Function}
 */
const run = async () => {
  await walk(SRC);

  await write(DIST, SPRITE.toString());

  process.exit(); // One-off commands must exit
};

/**
 * Export our methods
 *
 * @type {Object}
 */
module.exports = {
  run: run
};
