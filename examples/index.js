var kimi = require( './..' );
var driver = kimi( {

  onUpdate: onUpdate,
  onState: onState
});

// define some places for the driver
// 
// Parameters:
// first param is the name of the place/state
// second param is the value of that state/place
driver.state( 'alpha', [ 0, 100, 0 ] );
driver.state( 'idle', [ 300, 200, 0.5 ] );
driver.state( 'rollOver', [ 100, 200, 1 ] );
driver.state( 'omega', [ 0, 300, 0 ] );

// define a map for the driver to drive along
// fromTo defines the direction you can drive from states and how to drive
// 
// Parameters:
// first param is the start location
// second param is the end location
// third param is the distance in seconds between locations
// fourth param will be a function which will be used to interpolate values
driver.fromTo( 'alpha', 'idle', 3, interpolate );
driver.fromTo( 'idle', 'rollOver', 0.5, interpolate );
driver.fromTo( 'rollOver', 'idle', 5, interpolate );
driver.fromTo( 'idle', 'omega', 0.5, interpolate );

// set the initial state for the driver
driver.init( 'alpha' );

// calling the go function will change from the current state to the next
// you can call it at any point to change where you're going
// the driver always respects the map
driver.go( 'rollOver', function( value, time ) {

  console.log( '---- finished alpha -> rollOver', value );
});

// value comes from the interpolate function and time is the current time (in seconds)
// here you might do such things as update the look
function onUpdate( value, time ) {

  console.log( 'time', time );
  console.log( 'x', value[ 0 ] );
  console.log( 'y', value[ 1 ] );
  console.log( 'z', value[ 2 ] );
}

// onState will be called when we arrive at a different place
function onState() {

  console.log( arguments );
}

// animator function should return the value at the specific percentage
function interpolate( percentage, start, end ) {

  var rVal = [];

  start.forEach( function( startValue, i ) {

    var endValue = end[ i ];

    rVal[ i ] = ( endValue - startValue ) * percentage + startValue;
  });

  return rVal;
}