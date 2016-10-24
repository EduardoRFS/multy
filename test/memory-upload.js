'use strict';

const Promise = require('bluebird');
const Stream = require('stream');
const test = require('ava');
const request = require('supertest-as-promised');
const Koa = require('koa');
const multy = require('../lib');

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

const handler = app.listen();

test('single text', t => request(handler)
  .post('/')
  .field('foo', 'big banana')
  .field('bar', 'large')
  .expect(200, {
    foo: 'big banana',
    bar: 'large'
  })
);
//test('text json mimetype', t => throw 'Not Implemented');
test('array of text', t => request(handler)
  .post('/')
  .field('foo', 'big')
  .field('foo', 'banana')
  .field('bar', 'large')
  .expect(200, {
    foo: [ 'big', 'banana' ],
    bar: 'large'
  })
);
test('single files', t => request(handler)
  .post('/')
  .attach('foo', 'files/big.txt')
  .attach('bar', 'files/large.txt')
  .expect(200, {
    foo: 'big.txt\n',
    bar: 'large.txt\n'
  })
);
test('array of files', t => request(handler)
  .post('/')
  .attach('foo', 'files/big.txt')
  .attach('foo', 'files/banana.txt')
  .attach('bar', 'files/large.txt')
  .expect(200, {
    foo: [ 'big.txt\n', 'banana.txt\n' ],
    bar: 'large.txt\n'
  })
);
test('mixed single fields', t => request(handler)
  .post('/')
  .field('foo', 'big banana')
  .attach('bar', 'files/large.txt')
  .expect(200, {
    foo: 'big banana',
    bar: 'large.txt\n'
  })
);
test('same type array, text and files', t => request(handler)
  .post('/')
  .field('foo', 'big')
  .field('foo', 'banana')
  .attach('bar', 'files/big.txt')
  .attach('bar', 'files/banana.txt')
  .attach('bar', 'files/large.txt')
  .expect(200, {
    foo: [ 'big', 'banana' ],
    bar: [ 'big.txt\n', 'banana.txt\n', 'large.txt\n' ]
  })
);
test('magic mixed type array', t => request(handler)
  .post('/')
  .field('foo', 'big')
  .attach('foo', 'files/banana.txt')
  .field('foo', 'large')
  .attach('bar', 'files/big.txt')
  .field('bar', 'banana')
  .attach('bar', 'files/large.txt')
  .expect(200, {
    foo: [ 'big', 'banana.txt\n', 'large' ],
    bar: [ 'big.txt\n', 'banana', 'large.txt\n' ]
  })
);
