/**
 * Lei Pipe
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

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
  var pipes = this._pipes;
  var map = {};
  pipes.forEach(function (item) {
    map[item.name] = item;
  });
  var sort = pipes.slice(0);

  for (var i = 0, len = pipes.length; i < len; i++) {
    var item = pipes[i];
  }

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
 */
Pipe.prototype.start = function (data, callback) {
  debug('start %s', data);
  if (!this._inited) {
    try {
      this.init();
    } catch (err) {
      return callback(err);
    }
  }
  startPipe(this._pipes.slice(0), data, callback);
};



function parseAddArgs (args) {
  var name, options, handler;

  if (args.length >= 3) {
    name = args[0];
    options = args[1];
    handler = args[2];
  } else if (args.length === 1) {
    name = randomString(10);
    options = {};
    handler = args[0];
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      name = args[0];
      options = {};
    } else {
      name = randomString(10);
      options = args[0];
    }
    handler = args[1];
  } else {
    throw new TypeError('Wrong arguments number');
  }

  options.name = name;
  options.handler = handler;

  return options;
}

function randomString (size) {
  size = size || 6;
  var code_string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var max_num = code_string.length + 1;
  var new_pass = '';
  while (size > 0) {
    new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
    size--;
  }
  return new_pass;
}

function startPipe (pipes, data, callback) {
  var i = 0;
  var len = pipes.length;
  next(null, data);

  function next (err, d) {
    debug('startPipe next [%s/%s] (%s, %s)', i, len, err, d);
    if (arguments.length >= 2) data = d;
    if (err) return end(err, data);
    if (i < len) {
      var item = pipes[i++];
      item.handler(data, next, end);
    } else {
      end(err, data);
    }
  }

  function end (err, d) {
    debug('startPipe end (%s, %s)', err, d);
    err = err || null;
    if (arguments.length >= 2) data = d;
    callback(err, data);
  }
}
