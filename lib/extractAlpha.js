'use strict';

var util = require('util');
var PixelStream = require('pixel-stream');
var BufferList = require('bl');

/**
 * Change color space from RGBA to RGB
 * @param {Object} backgroundColor in {r: 0, g: 0, b: 0} format where each component is normalized between 0 and 1
 */
function ExtractAlpha() {
  PixelStream.call(this);
  this.buffer = new BufferList();
}

util.inherits(ExtractAlpha, PixelStream);

ExtractAlpha.prototype._start = function(done) {
  this._components = 4;
  done();
};

ExtractAlpha.prototype._writePixels = function(data, done) {
  this.buffer.append(data);

  // make sure we have enough data
  if (this.buffer.length >= this._components) {
    // handle case where data length is not on a pixel boundary
    var tail = this.buffer.length - (this.buffer.length % this._components);
    var buf = this.buffer.slice(0, tail);
    this.buffer.consume(buf.length);
    this.push(this.extractAlpha(buf));
  }

  done();
};

ExtractAlpha.prototype.extractAlpha = function(data) {
  var res = new Buffer(data.length);
  var i = 0, j = 0;

  while (data.length - i >= 4) {
    var r = data[i++],
        g = data[i++],
        b = data[i++],
        a = data[i++];

    res[j++] = 0;
    res[j++] = 0;
    res[j++] = 0;
    res[j++] = a;
  }

  return res;
};

module.exports = ExtractAlpha;
