var Benchmark = require('benchmark');
var buft = require('buffertools');
var suite = new Benchmark.Suite;

var s1 = '1234';
var s2 = '4567';
var b1 = Buffer(s1);
var b2 = Buffer(s2);
buft.compare(b1, b2);
// add tests
suite.add('Buffer Compare', function() {
  buft.compare(b1, b2);
})
.add('String Compare', function() {
  s1 === s2;
})
.add('Buffer tostring', function() {
  b1.toString();
  b2.toString();
})
.add('Buffer tostring compare', function() {
  b1.toString() === b2.toString();
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run();
