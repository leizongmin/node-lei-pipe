/**
 * Auto Fill before & after
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

module.exports = exports = autoFill;

function autoFill (pipes) {
  // // console.log(pipes);
  pipes.forEach(function (item) {
    var a = item.name;
    item.before.forEach(function (b) {
      // console.log('%s before %s', a, b);
      pipeAddAfter(pipes, b, a);
      nestFillBefore(pipes, b, a);
      // console.log('---');
    });
    item.after.forEach(function (b) {
      // console.log('%s after %s', a, b);
      pipeAddBefore(pipes, b, a);
      nestFillAfter(pipes, a, b);
      // console.log('---');
    });
  });
  // console.log('--------------------------------');
  // console.log(pipes);
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
  // console.log('    add %s => [%s]', v, list.join(', '));
}

function pipeAddAfter (pipes, me, n, notAuto) {
  // console.log('  set %s after %s', me, n);
  var i = findPipe(pipes, me);
  if (i === -1) return;
  var p = pipes[i];
  addUniqueItem(p.after, n);
  if (notAuto) return;
  pipeAddBefore(pipes, n, me, true);
}

function pipeAddBefore (pipes, me, n, notAuto) {
  // console.log('  set %s before %s', me, n);
  var i = findPipe(pipes, me);
  if (i === -1) return;
  var p = pipes[i];
  addUniqueItem(p.before, n);
  if (notAuto) return;
  pipeAddAfter(pipes, n, me, true);
}
/*
var pipes = [
  {name: 'a', before: [], after: []},
  {name: 'b', before: ['a'], after: ['c']},
  {name: 'c', before: ['a'], after: ['e']},
  {name: 'd', before: ['c'], after: []},
  {name: 'e', before: [], after: []}
];
var d = autoFill(pipes);
*/
