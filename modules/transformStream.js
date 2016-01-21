  var Transform = require('stream').Transform,
    util = require('util');

  var TransformStream = function() {
    Transform.call(this, {
      objectMode: true
    });
  };

  util.inherits(TransformStream, Transform);

  TransformStream.prototype._pause = function() {
    this.pause();
  }

  TransformStream.prototype._resume = function() {
    this.resume();
  }

  TransformStream.prototype._transform = function(chunk, encoding, callback) {
    if (typeof chunk.originalValue === 'undefined')
      chunk.originalValue = chunk.value;
    chunk.value++;

    this.push(chunk);
    callback();
  };

  module.exports = TransformStream;