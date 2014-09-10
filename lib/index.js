/**
 * Lei Pipe
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var uuid = require('uuid');
var autoFill = require('./fill');
var sortPipes = require('./sort');
var debug = require('debug')('lei:pipe');

module.exports = Pipe;

function Pipe () {
  if (!(this instanceof Pipe)) return new Pipe();
  debug('new');
  this._pipes = [];
  this._inited = false;
}

/**
 * Init
 */
Pipe.prototype.init = function () {
  debug('init');
  this._pipes = sortPipes(autoFill(this._pipes));
  this._inited = true;
};

/**
 * Add
 *
 * @param {String} name
 * @param {Object} options
 *   - {Array} before
 *   - {Array} after
 * @param {Function} handler
 */
Pipe.prototype.add = function () {
  var args = parseAddArgs(arguments);
  debug('add %s', args.name);
  this._pipes.push(args);
};

/**
 * Start
 *
 * @param {Object} data
 * @param {Function} callback
 * @param {Object} data2
 */
Pipe.prototype.start = function (data, callback, data2) {
  debug('start %s', data);
  if (!this._inited) {
    try {
      this.init();
    } catch (err) {
      return callback(err);
    }
  }
  startPipe(this._pipes.slice(0), data, callback, data2);
};



function parseAddArgs (args) {
  var name, options, handler;

  if (args.length >= 3) {
    name = args[0];
    options = args[1];
    handler = args[2];
  } else if (args.length === 1) {
    name = uuid.v4();
    options = {};
    handler = args[0];
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      name = args[0];
      options = {};
    } else {
      name = uuid.v4();
      options = args[0];
    }
    handler = args[1];
  } else {
    throw new TypeError('Wrong arguments number');
  }

  options.name = name;
  options.handler = handler;
  options.before = options.before || [];
  options.after = options.after || [];

  return options;
}

function startPipe (pipes, data, callback, data2) {
  var i = 0;
  var len = pipes.length;
  next(null, data);

  function next (err, d) {
    debug('startPipe next [%s/%s] (%s, %s)', i, len, err, d);
    if (arguments.length >= 2) data = d;
    if (err) return end(err, data);
    if (i < len) {
      var item = pipes[i++];
      try {
        item.handler(data, next, end, data2);
      } catch (err) {
        return end(err, data);
      }
    } else {
      end(err, data);
    }
  }

  function end (err, d) {
    debug('startPipe end (%s, %s)', err, d);
    err = err || null;
    if (arguments.length >= 2) data = d;
    callback(err, data, data2);
  }
}
