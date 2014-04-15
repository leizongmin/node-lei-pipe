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
    var a = item.name;
    item.before.forEach(function (b) {
      setBefore(a, b);
    });
    item.after.forEach(function (b) {
      setAfter(a, b);
    });
  }

  console.log(sort);

  this._pipes = sort;
  this._inited = true;

  function findPipe (name) {
    for (var i = 0; i < sort.length; i++) {
      var item = sort[i];
      if (item.name === name) return i;
    }
    return -1;
  }

  // set a before b
  function setBefore (a, b) {
    debug(' - set %s before %s', a, b);
    var ai = findPipe(a);
    var bi = findPipe(b);
    if (ai < 0 || bi < 0) return;
    debug('     %s => %s', ai, bi);
    if (ai < bi) return;
    var ap = sort[ai];
    var bp = sort[bi];
    sort.splice(ai, 1);
    sort.splice(bi, 0, ap);
    addUniqueItem(ap.before, bp.name);
    addUniqueItem(bp.after, ap.name);
    // set childs
    bp.before.forEach(function (c) {
      debug('------ set %s.before list', a);
      setBefore(c, b);
      debug('------');
    });
  }

  // set a after b
  function setAfter (a, b) {
    debug(' - set %s after %s', a, b);
    var ai = findPipe(a);
    var bi = findPipe(b);
    if (ai < 0 || bi < 0) return;
    debug('     %s => %s', ai, bi);
    if (ai > bi) return;
    var ap = sort[ai];
    var bp = sort[bi];
    sort.splice(ai, 1);
    sort.splice(bi, 0, ap);
    addUniqueItem(ap.after, bp.name);
    addUniqueItem(bp.before, ap.name);
    // set childs
    ap.before.forEach(function (c) {
      debug('------ set %s.before list', a);
      setAfter(c, b);
      debug('------');
    });
  }

  function addUniqueItem (list, v) {
    var i = list.indexOf(v);
    if (v === -1) list.push(v);
  }
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
  options.before = options.before || [];
  options.after = options.after || [];

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
