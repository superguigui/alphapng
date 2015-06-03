#! /usr/bin/env node

'use strict';

var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var gm = require('gm');
var Png = require('pngjs').PNG;
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

gm(rstream).compress('JPEG').quality(quality).write(outputFileJpgPath, function(err) {
  if (!err) {
    console.log(chalk.blue('alphapng'), 'saved rgb channels to', chalk.blue(outputFileJpgPath), 'at quality', chalk.blue(quality));
  }
});

rstream
  .pipe(new Png({
    filterType: 4
  }))
  .on('parsed', function() {
    var x, y, i;
    for (y = 0; y < this.height; y++) {
      for (x = 0; x < this.width; x++) {
        i = (this.width * y + x) << 2;
        this.data[i + 0] = 0;
        this.data[i + 1] = 0;
        this.data[i + 2] = 0;
      }
    }
    this.pack().pipe(fs.createWriteStream(outputFilePngPath));
    console.log(chalk.blue('alphapng'), 'saved alpha channel to', chalk.blue(outputFilePngPath));
  });
