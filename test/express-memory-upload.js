'use strict';

const Promise = require('bluebird');
const Stream = require('stream');
const multy = require('../lib');
const memoryUpload = require('../test-base/memory-upload');

const app = require('express')();
app.use(multy());
app.use(async (req, res, next) => {
  const body = {};

  for (let key in req.body) {
    const field = req.body[key];
    if (Array.isArray(field))
      body[key] = await Promise.map(field, mapField);
    else
      body[key] = await mapField(field);
  }

  if (Object.keys(body).length > 0)
    return res.send(body);
  return next();

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
