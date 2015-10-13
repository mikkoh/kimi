var test = require('tape');

test('normal test', require('./normalTest'));
test('shortest paths', require('./testShortestPath'));
test('set state', require('./setState'));  