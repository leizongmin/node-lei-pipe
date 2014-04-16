/**
 * Lei Pipe Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var should = require('should');
var Pipe = require('../');

describe('lei-pipe', function () {

  it('#conflict - 1', function (done) {
    var p = new Pipe();
    p.add('a', {before: ['b']}, function (data, next) {
      next(null, data + 'a');
    });
    p.add('b', {before: ['a'], after: ['c']}, function (data, next) {
      next(null, data + 'b');
    });
    p.add('c', {before: ['a']}, function (data, next) {
      next(null, data + 'c');
    });
    p.add('d', {before: ['c']}, function (data, next) {
      next(null, data + 'd');
    });
    p.start('', function (err, data) {
      err.should.instanceof(Error);
      done();
    });
  });

});
