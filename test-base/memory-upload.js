'use strict';

const test = require('ava');
const request = require('supertest-as-promised');

module.exports = function (handler) {
  test('non multipart', t => request(handler)
    .post('/')
    .expect(404)
  );
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
};
