#! /usr/bin/env node

'use strict';

var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var PNGDecoder = require('png-stream/decoder');
var PNGEncoder = require('png-stream/encoder');
var JPEGEncoder = require('jpg-stream/encoder');
var RgbaToRgb = require('./lib/rgbaToRgb');
var ExtractAlpha = require('./lib/extractAlpha');
var version = require('./package.json').version;

/* --------------------------------------------------------------------
  Options
-------------------------------------------------------------------- */
var inputFilePath = argv._[0];
var outputFileName = argv.f || argv.filename || 'out';
var quality = argv.q || argv.quality || 50;
var isHelpNeeded = argv.h || argv.help || false;
var isVersionRequested = argv.v || argv.version || false;
var outputFilePngPath = outputFileName + '.png';
var outputFileJpgPath = outputFileName + '.jpg';
var nbTasks = 2;

/* --------------------------------------------------------------------
  Some Methods (impures, need to be refactored to be moved to lib)
-------------------------------------------------------------------- */
function showError(msg) {
  console.log(chalk.red(msg));
}

function showHelp() {
  var h = [
    'alphapng ' + version,
    '',
    'Usage:',
    '  alphapng png',
    '',
    'Params:',
    '  png   input png file to process',
    '',
    'Options:',
    '  -h, --help        show help',
    '  -v, --version     show version',
    '  -f, --filename    name of the new png and jpg (no extension, default is "out")',
    '  -q, --quality     jpg compression quality'
  ].join('\n');
  console.log(h);
}

function showVersion() {
  console.log(version);
}

function taskOver() {
  nbTasks--;
  if (!nbTasks) {
    console.log(
      chalk.blue('alphapng'),
      chalk.gray('saved rgb channels to'),
      chalk.white(outputFileJpgPath),
      chalk.gray('with quality'),
      chalk.white(quality),
      chalk.gray('and alpha channel to'),
      chalk.white(outputFilePngPath)
    );
  }
}

/* --------------------------------------------------------------------
  Check inputs
-------------------------------------------------------------------- */
if (!inputFilePath) return showError('You need to provide an input png file, ex: alphapng toto.png');
if (isVersionRequested) return showVersion();
if (isHelpNeeded) return showHelp();


/* --------------------------------------------------------------------
  Start
-------------------------------------------------------------------- */
var rstream = fs.createReadStream(inputFilePath);

rstream
  .pipe(new PNGDecoder)
  .pipe(new RgbaToRgb())
  .pipe(new JPEGEncoder({quality: quality}))
  .pipe(fs.createWriteStream(outputFileJpgPath))
  .on('close', taskOver);

rstream
  .pipe(new PNGDecoder)
  .pipe(new ExtractAlpha())
  .pipe(new PNGEncoder())
  .pipe(fs.createWriteStream(outputFilePngPath))
  .on('close', taskOver);
