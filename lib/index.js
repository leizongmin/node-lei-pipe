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
  var sort = autoFill(pipes.slice(0));

  for (var i = 0, len = pipes.length; i < len; i++) {
    var item = pipes[i];
    var a = item.name;
    item.after.forEach(function (b) {
      setAfter(a, b);
    });
    item.before.forEach(function (b) {
      setBefore(a, b);
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
    if (ai < bi) return;
    debug('     %s => %s', ai, bi);
    var ap = sort[ai];
    var bp = sort[bi];
    sort.splice(ai, 1);
    sort.splice(bi, 0, ap);
    addUniqueItem(ap.before, bp.name);
    addUniqueItem(bp.after, ap.name);
  }

  // set a after b
  function setAfter (a, b) {
    debug(' - set %s after %s', a, b);
    var ai = findPipe(a);
    var bi = findPipe(b);
    if (ai < 0 || bi < 0) return;
    if (ai > bi) return;
    debug('     %s => %s', ai, bi);
    var ap = sort[ai];
    var bp = sort[bi];
    sort.splice(ai, 1);
    sort.splice(bi, 0, ap);
    addUniqueItem(ap.after, bp.name);
    addUniqueItem(bp.before, ap.name);
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

// -----------------------------------------------------------------------------

function autoFill (pipes) {
  console.log(pipes);
  pipes.forEach(function (item) {
    var a = item.name;
    item.before.forEach(function (b) {
      console.log('%s before %s', a, b);
      pipeAddAfter(pipes, b, a);
      nestFillBefore(pipes, b, a);
      console.log('---');
    });
    item.after.forEach(function (b) {
      console.log('%s after %s', a, b);
      pipeAddBefore(pipes, b, a);
      nestFillAfter(pipes, a, b);
      console.log('---');
    });
  });
  console.log('--------------------------------');
  console.log(pipes);
  return pipes;
}

function nestFillBefore (pipes, b, a) {
  var i = findPipe(pipes, b);
  if (i === -1) return;
  pipes[i].before.forEach(function (b) {
    pipeAddAfter(pipes, b, a);
    nestFillBefore(pipes, b, a);
  });
}

function nestFillAfter (pipes, a, b) {
  var i = findPipe(pipes, a);
  if (i === -1) return;
  pipes[i].before.forEach(function (a) {
    pipeAddBefore(pipes, b, a);
    nestFillAfter(pipes, a, b);
  });
}

function findPipe (pipes, name) {
  for (var i = 0; i < pipes.length; i++) {
    var item = pipes[i];
    if (item.name === name) return i;
  }
  return -1;
}

function addUniqueItem (list, v) {
  var i = list.indexOf(v);
  if (i === -1) list.push(v);
  console.log('    add %s => [%s]', v, list.join(', '));
}

function pipeAddAfter (pipes, me, n) {
  console.log('  set %s after %s', me, n);
  var i = findPipe(pipes, me);
  if (i === -1) return;
  var p = pipes[i];
  addUniqueItem(p.after, n);
}

function pipeAddBefore (pipes, me, n) {
  console.log('  set %s before %s', me, n);
  var i = findPipe(pipes, me);
  if (i === -1) return;
  var p = pipes[i];
  addUniqueItem(p.before, n);
}

var pipes = [
  {name: 'a', before: [], after: []},
  {name: 'b', before: ['a'], after: ['c']},
  {name: 'c', before: ['a'], after: ['e']},
  {name: 'd', before: ['c'], after: []},
  {name: 'e', before: [], after: []}
];
var d = autoFill(pipes);

