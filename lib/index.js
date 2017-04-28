'use strict';

var Promise = require('any-promise');
var Busboy = require('busboy');
var streamToBuffer = require('stream-to-buffer');
var PassThrough = require('stream').PassThrough;

module.exports = Multy;

function Multy (options) {
  return function multy (ctx, _, next) {
    if (!next)
      next = _;
    if (!ctx.is('multipart/form-data'))
      return next();
    options = options || {}
    options.headers = ctx.headers
    var busboy = new Busboy(options)
    var promise = promisify(busboy);
    var body;
    if (ctx.request)
      body = ctx.request.body = {}
    else
      body = ctx.body = {};

    busboy.on('field', fieldHandler(body));
    busboy.on('file', fileHandler(body));

    (ctx.req || ctx).pipe(busboy);

    return promise.then(next);
  }
}


function promisify (busboy) {
  return new Promise((resolve, reject) => {
    busboy.on('error', reject);
    busboy.on('finish', resolve);
  });
}
function fieldHandler (body) {
  return function (name, value, x1, x2, x3, mimetype) {
    if (mimetype === 'application/json')
      value = JSON.parse(value);
    pushToBody(body, name, value);
  }
}
function fileHandler (body) {
  return function (name, file, filename, encoding, mimetype) {
    streamToBuffer(file, (err, buffer) => {
      if (err) throw err;
      stream.end(buffer);
    });
    var stream = new PassThrough();
    stream.name = filename;
    stream.mimetype = mimetype;
    stream.encoding = encoding;
    pushToBody(body, name, stream);
  }
}
function pushToBody (body, name, value) {
  if (body[name] && !Array.isArray(body[name]))
    body[name] = [ body[name], value ];
  else if (body[name])
    body[name].push(value);
  else
    body[name] = value;
}
