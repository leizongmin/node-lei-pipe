node-lei-pipe
=============

[![Greenkeeper badge](https://badges.greenkeeper.io/leizongmin/node-lei-pipe.svg)](https://greenkeeper.io/)

流水线式执行一系列函数，可指定简单的依赖关系

```JavaScript
var Pipe = require('lei-pipe');

var p = new Pipe();
p.add(function (data, next) {
  // ...
  next();
});
p.add('a', function (data, next) {
  // ...
  next();
});
p.add({before: ['a']}, function (data, next) {
  // ...
  next();
});
p.add('b', {after: ['a']}, function (data, next) {
  // ...
  next();
});
p.start(123, function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

详细使用方法请参考测试文件。
