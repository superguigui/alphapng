'use strict';

var util = require('util');
var PixelStream = require('pixel-stream');
var BufferList = require('bl');

/**
 * Change color space from RGBA to RGB
 * @param {Object} backgroundColor in {r: 0, g: 0, b: 0} format where each component is normalized between 0 and 1
 */
function RgbaToRgb(backgroundColor) {
  PixelStream.call(this);
  this.backgroundColor = {
    r: backgroundColor ? backgroundColor.r | 0 : 0,
    g: backgroundColor ? backgroundColor.g | 0 : 0,
    b: backgroundColor ? backgroundColor.b | 0 : 0
  };
  this.buffer = new BufferList();
}

util.inherits(RgbaToRgb, PixelStream);

RgbaToRgb.prototype._start = function(done) {
  this._components = 4;

  this.format.colorSpace = 'rgb';

  if (this._frameSize === 0)
    this._frameSize = 100 * 100 * this._components;

  done();
};

RgbaToRgb.prototype._writePixels = function(data, done) {
  this.buffer.append(data);

  // make sure we have enough data
  if (this.buffer.length >= this._components) {
    // handle case where data length is not on a pixel boundary
    var tail = this.buffer.length - (this.buffer.length % this._components);
    var buf = this.buffer.slice(0, tail);
    this.buffer.consume(buf.length);
    this.push(this.rgba2rgb(buf));
  }

  done();
};

RgbaToRgb.prototype.rgba2rgb = function(data) {
  var res = new Buffer((data.length / 4) * 3);
  var i = 0, j = 0;

  while (data.length - i >= 4) {
    var r = data[i++] / 255,
        g = data[i++] / 255,
        b = data[i++] / 255,
        a = data[i++] / 255;

    res[j++] = Math.min(255, (((1 - a) * this.backgroundColor.r) + (a * r)) * 255);
    res[j++] = Math.min(255, (((1 - a) * this.backgroundColor.g) + (a * g)) * 255);
    res[j++] = Math.min(255, (((1 - a) * this.backgroundColor.b) + (a * b)) * 255);
  }

  return res;
};

module.exports = RgbaToRgb;
