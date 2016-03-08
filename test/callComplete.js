var kimi = require('./..');

module.exports = function(t) {
  var calledCallback = false;
  var calledGoingToSame = false;
  var driver = kimi({
    manualStep: true
  });

  driver.state('out', 10);
  driver.state('idle', 23);

  driver.fromTo('out', 'idle', 0.333, function() {});

  driver.init('out');
  driver.go('idle', function() {
    calledCallback = true;
  });
  driver.step(1000000);

  driver.go('idle', function() {
    calledGoingToSame = true;
  });
  driver.step(1000000);

  t.ok(calledCallback, 'called callback after go');
  t.ok(calledGoingToSame, 'called the callback when attempting to go to the state we\'re already in');
  t.end();
};