var test = require('tape');

module.exports = runTest;

if(!module.parent) {
  runTest();
}

function runTest() {

  test('normal test', require('./normalTest'));
  test('shortest paths', require('./testShortestPath'));
  test('set state', require('./setState'));  
};