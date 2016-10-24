'use strict';

const Buffer = require('buffer').Buffer;
const Readable = require('stream').Readable;

class BufferStream extends Readable {
  constructor (buffer, options) {
    super(options);
    this.push(buffer);
  }
  _read () {
    
  }
}

module.exports = BufferStream;
