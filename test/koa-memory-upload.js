'use strict';

const Promise = require('bluebird');
const Stream = require('stream');
const Koa = require('koa');
const multy = require('../lib');
const memoryUpload = require('../test-base/memory-upload');

const app = new Koa();
app.use(multy());
app.use(async ctx => {
  const body = {};

  for (let key in ctx.request.body) {
    const field = ctx.request.body[key];
    if (Array.isArray(field))
      body[key] = await Promise.map(field, mapField);
    else
      body[key] = await mapField(field);
  }
  if (Object.keys(body).length > 0)
    ctx.body = body;

  function mapField (field) {
    if (field instanceof Stream) {
      var buff = '';
      field.on('data', data => buff += data);
      return new Promise((resolve, reject) => {
        field.on('error', reject);
        field.on('end', _ => resolve(buff));
      });
    }
    return field;
  }
});

memoryUpload(app.listen());
