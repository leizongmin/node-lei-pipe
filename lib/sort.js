/**
 * Auto Fill before & after
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = exports = sortPipes;

function sortPipes (pipes) {
  for (var i = 0; i < pipes.length; i++) {
    var item = pipes[i];
    var a = item.name;
    var isChanged = false;

    var ai = findPipe(pipes, a);
    var bi = findMinPipe(pipes, item.before);
    // console.log('[%s] %s before [%s]', pipeNames(pipes), a, item.before);
    if (bi >= 0 && bi < ai) {
      setBefore(pipes, ai, bi);
      isChanged = true;
    }

    var ai = findPipe(pipes, a);
    var bi = findMaxPipe(pipes, item.after);
    // console.log('[%s] %s after [%s]', pipeNames(pipes), a, item.after);
    if (bi >= 0 && ai < bi) {
      setAfter(pipes, ai, bi);
      isChanged = true;
    }

    if (isChanged) {
      i = -1;
    }
  }
  return pipes;
}


function findPipe (pipes, name) {
  for (var i = 0; i < pipes.length; i++) {
    var item = pipes[i];
    if (item.name === name) return i;
  }
  return -1;
}

function findPipes (pipes, list) {
  list = list.map(function (n) {
    return findPipe(pipes, n);
  }).filter(function (i) {
    return i >= 0;
  });
  if (list.length < 1) list = [-1];
  return list;
}

function findMinPipe (pipes, list) {
  list = findPipes(pipes, list);
  return Math.min.apply(Math, list);
}

function findMaxPipe (pipes, list) {
  list = findPipes(pipes, list);
  return Math.max.apply(Math, list);
}

// set a after b
function setAfter (pipes, ai, bi) {
  // console.log('  move %s => %s', ai, bi);
  var ap = pipes[ai];
  pipes.splice(ai, 1);
  pipes.splice(bi, 0, ap);
}

// set a before b
function setBefore (pipes, ai, bi) {
  // console.log('  move %s => %s', ai, bi);
  var ap = pipes[ai];
  pipes.splice(ai, 1);
  pipes.splice(bi, 0, ap);
}

/*
var autoFill = require('./fill');
function pipeNames (pipes) {
  return pipes.map(function (item) {
    return item.name;
  });
}
var pipes = [
  {name: 'a', before: [], after: []},
  {name: 'b', before: ['a'], after: ['c']},
  {name: 'c', before: ['a'], after: ['e']},
  {name: 'd', before: ['c'], after: []},
  {name: 'e', before: [], after: []}
];
var d = autoFill(pipes);
d = sortPipes(d);
console.log(pipeNames(d));
*/
