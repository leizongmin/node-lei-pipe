/**
 * Lei Pipe Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var should = require('should');
var Pipe = require('../');

describe('lei-pipe', function () {

  it('#sort - 1', function (done) {
    var p = new Pipe();
    p.add('a', function (data, next) {
      next(null, data + 'a');
    });
    p.add('b', function (data, next) {
      next(null, data + 'b');
    });
    p.add('c', function (data, next) {
      next(null, data + 'c');
    });
    p.add('d', function (data, next) {
      next(null, data + 'd');
    });
    p.start('', function (err, data) {
      should.equal(err, null);
      data.should.equal('abcd');
      done();
    });
  });

  it('#sort - 2', function (done) {
    var p = new Pipe();
    p.add('a', function (data, next) {
      next(null, data + 'a');
    });
    p.add('b', {before: ['a']}, function (data, next) {
      next(null, data + 'b');
    });
    p.add('c', {before: ['a']}, function (data, next) {
      next(null, data + 'c');
    });
    p.add('d', {before: ['c']}, function (data, next) {
      next(null, data + 'd');
    });
    p.start('', function (err, data) {
      should.equal(err, null);
      data.should.equal('bdca');
      done();
    });
  });

});
