/**
 * Lei Pipe Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var should = require('should');
var Pipe = require('../');

describe('lei-pipe', function () {

  it('#create', function () {
    var p1 = Pipe();
    var p2 = new Pipe();
    p1.should.instanceof(Pipe);
    p2.should.instanceof(Pipe);
  });

  it('#base - no change', function (done) {
    var p = new Pipe();
    p.add(function (data, next) {
      data++;
      next();
    });
    p.add(function (data, next) {
      data++;
      next();
    });
    p.add(function (data, next) {
      data++;
      next();
    });
    p.start(1, function (err, data) {
      should.equal(err, null);
      data.should.equal(1);
      done();
    });
  });

  it('#base - change', function (done) {
    var p = new Pipe();
    p.add(function (data, next) {
      data++;
      next(null, data);
    });
    p.add(function (data, next) {
      data++;
      next(null, data);
    });
    p.add(function (data, next) {
      data++;
      next(null, data);
    });
    p.start(1, function (err, data) {
      should.equal(err, null);
      data.should.equal(4);
      done();
    });
  });

});
