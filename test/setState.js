var kimi = require('./..');

var EXPECTED_EVENTS = [ 'state', 'update', 'update', 'state', 'update', 'update' ];
var EXPECTED_STATES = [ 'a',     'a',      'a',      'c',     'c',      'c'      ];
var EXPECTED_VALUES = [ 10,      10.1,     10.2,     12,      11.9,     11.8     ];

module.exports = function(t) {

  var events = [];
  var states = [];
  var values = [];
  var callBackCalled = false;
  var driver = kimi({
    manualStep: true,
    onUpdate: onUpdate,
    onState: onState
  });

  driver.state('a', 10);
  driver.state('b', 11);
  driver.state('c', 12);

  driver.fromTo('a', 'b', 1, interpolate);
  driver.fromTo('b', 'a', 1, interpolate);
  driver.fromTo('b', 'c', 1, interpolate);
  driver.fromTo('c', 'b', 1, interpolate);

  driver.init('a');
  driver.go('c', function() {
    callBackCalled = true;
    console.log('called');
  });

  driver.step(100);
  driver.step(100);

  driver.set('c');

  t.ok(callBackCalled, 'callback was called after state set');

  driver.step(100);
  driver.step(100);

  driver.go('a');

  driver.step(100);
  driver.step(100);

  t.deepEqual(events, EXPECTED_EVENTS, 'events with set in middle are correct');
  t.deepEqual(states, EXPECTED_STATES, 'states with set in middle are correct');
  t.deepEqual(values, EXPECTED_VALUES, 'values with set in middle are correct');
  t.end();


  function interpolate(amount, start, end) {
    return (end - start) * amount + start;
  }

  function onUpdate(value, state, time) {
    events.push('update'),
    values.push(value);
    states.push(state);
  }

  function onState(value, state, time) {
    events.push('state'),
    values.push(value);
    states.push(state);
  }
};