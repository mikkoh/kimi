var kimi = require('./..');

module.exports = function(t) {

  var states = [];
  var driver = kimi( {
    manualStep: true,
    onUpdate: onUpdate,
    onState: onState
  });
  

  driver.state('toronto', 'toronto');
  driver.state('orlando', 'orlando');
  driver.state('vancouver', 'vancouver');
  driver.state('tokyo', 'tokyo');

  driver.fromTo('toronto', 'orlando', 1, interpolate);
  driver.fromTo('orlando', 'toronto', 1, interpolate);

  driver.fromTo('toronto', 'tokyo', 3, interpolate);

  driver.fromTo('toronto', 'vancouver', 1, interpolate);
  driver.fromTo('vancouver', 'toronto', 1, interpolate);

  driver.fromTo('vancouver', 'tokyo', 1, interpolate);
  driver.fromTo('tokyo', 'vancouver', 1, interpolate);

  driver.init('toronto');
  driver.go('tokyo');

  driver.step(20000);
  driver.step(20000);
  driver.step(20000);

  driver.go('vancouver');

  driver.step(500);

  driver.go('tokyo');

  driver.step(20000);

  t.deepEqual(states, [ 'toronto', 'vancouver', 'tokyo', 'tokyo' ], 'went along shortest paths and did a reverse');
  t.end();

  function interpolate(amount, start, end) {
    return amount > 0.5 ? end : start;
  }

  function onUpdate(value, state, time) {
    // console.log(state);
  }

  function onState(value, state, time) {
    // console.log('STATE', state);
    states.push(state);
  }
};