var kimi = require( './..' );
var getFuzzyTest = require('test-fuzzy-array');


var EXPECTED_EVENTS =   ['update', 'state', 'update', 'update', 'update', 'update', 'state', 'update', 'update', 'update', 'update', 'update', 'state' ];
var EXPECTED_STATES =   ['out',    'out',   'out',    'out',    'out',    'idle',   'idle',  'idle',   'idle',   'idle',   'idle',   'rolled', 'rolled'];
var EXPECTED_TIMES =    [0,        0,       0.1,      0.2,      0.3,      0,        0,       0.1,      0.2,      0.3,      0.4,      0,        0       ];
var EXPECTED_DURATION = [0,                 0.333,    0.333,    0.333,    0.333,             0.5,      0.5,      0.5,      0.5,      0.5               ];
var EXPECTED_VALUES =   [10,       10,      13.903,   17.807,   21.711,   23,       23,      29.8,     36.6,     43.4,     50.2,     57,       57      ];


module.exports = function(t) {

  var events = [];
  var states = [];
  var values = [];
  var times = [];
  var durations = [];
  var driver = kimi( {
    manualStep: true,
    onUpdate: onUpdate,
    onState: onState
  });

  driver.state('out', 10);
  driver.state('idle', 23);
  driver.state('rolled', 57);

  driver.fromTo('out', 'idle', 0.333, interpolate);
  driver.fromTo('idle', 'rolled', 0.5, interpolate);

  driver.init('out');
  driver.go('rolled');

  // we'll step more than we need to
  for(var i = 0; i < 10000; i++) {
    driver.step(100);
  }

  t.deepEqual(events, EXPECTED_EVENTS, 'events were correct');
  t.deepEqual(states, EXPECTED_STATES, 'states were correct');
  t.deepEqual(times, EXPECTED_TIMES, 'times were correct');
  t.deepEqual(durations, EXPECTED_DURATION, 'durations were correct');
  getFuzzyTest(t, 0.01)(values, EXPECTED_VALUES, 'values were correctish');

  // count how many times 'state' is in the array should only be 3 times
  t.equal(events.filter( function(value) {
    return value === 'state'
  }).length, 3, 'on state is called only 3 times');

  // test that onStates receive correct values
  t.deepEqual(values.filter( function(value, i) {
    return events[ i ] === 'state';
  }), [ 10, 23, 57 ], 'on state events received the correct values');

  t.end();

  function onUpdate(value, state, time, duration) {
    events.push('update');
    states.push(state);
    values.push(value);
    times.push(time);
    durations.push(duration);
  }

  function onState(value, state, time) {
    events.push('state');
    states.push(state);
    values.push(value);
    times.push(time);
  }

  function interpolate(amount, start, end) {
    return (end - start) * amount + start;
  }
};