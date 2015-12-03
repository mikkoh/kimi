var kimi = require('./..');
var getFuzzyTest = require('test-fuzzy-array');

var EXPECTED_EVENTS = [ 'update', 'state', 'update', 'update', 'update' ]
var EXPECTED_STATES = [ 'out', 'out', 'out', 'out', 'out' ]
var EXPECTED_VALUES = [ 10, 10, 10.1, 10.2, 10.3 ]
var EXPECTED_TIMES = [ 0, 0, 0.1, 0.2, 0.3  ];


module.exports = function(t) {

  var events = [];
  var states = [];
  var values = [];
  var times = [];

  var driver = kimi( {
    manualStep: true,
    onUpdate: onUpdate,
    onState: onState
  });

  driver.state('out', 10);
  driver.state('idle', 20);

  driver.fromTo('out', 'idle', 10, interpolate);

  driver.init('out');
  driver.go('idle');

  driver.step(100);
  driver.step(100);
  driver.step(100);

  driver.destroy();

  driver.step(100);
  driver.step(100);
  driver.step(100);
  driver.step(100000);

  t.deepEqual(events, EXPECTED_EVENTS, 'events were correct');
  t.deepEqual(states, EXPECTED_STATES, 'states were correct');
  t.deepEqual(times, EXPECTED_TIMES, 'times were correct');
  getFuzzyTest(t, 0.01)(values, EXPECTED_VALUES, 'values were correctish');

  t.end();

  function interpolate(amount, start, end) {
    return (end - start) * amount + start;
  }

  function onUpdate(value, state, time) {
    events.push('update');
    states.push(state);
    values.push(value);
    times.push(time);
  }

  function onState(value, state, time) {
    events.push('state');
    states.push(state);
    values.push(value);
    times.push(time);
  }
};