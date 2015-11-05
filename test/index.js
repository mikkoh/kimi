var test = require('tape');

test('normal test', require('./normalTest'));
test('call callback after go', require('./callComplete'));
test('shortest paths', require('./testShortestPath'));
test('set state', require('./setState'));  
test('destroy', require('./destroy'));