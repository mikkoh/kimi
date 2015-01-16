var kimi = require( './..' );

var driver = kimi();

driver.state( 'alpha', [ 0, -100, 0 ] );
driver.state( 'idle', [ 0, 0, 0.5 ] );
driver.state( 'rollOver', [ 0, 0, 1 ] );
driver.state( 'omega', [ 0, 100, 0 ] );

driver.fromTo( 'alpha', 'idle', 1, animator );
driver.fromTo( 'idle', 'rollOver', 1, animator );
driver.fromTo( 'rollOver', 'idle', 1, animator );
driver.fromTo( 'idle', 'omega', 1, animator );

var logValue = function( value, time ) {

  console.log( 'time: ', time );
  console.log( 'value: ', value );
};

driver.go( 'rollOver', logValue, function( value, time ) {

  console.log( '---- finished alpha -> rollOver', value );

  driver.go( 'omega', logValue, function( value ) {

    console.log( '---- finished rollOver -> omega', value );
  });
});

function animator( percentage, start, end ) {

  var rVal = [];

  start.forEach( function( startValue, i ) {

    var endValue = end[ i ];

    rVal[ i ] = ( endValue - startValue ) * percentage + startValue;
  });

  return rVal;
}