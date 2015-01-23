var kimi = require( './..' );

var driver = kimi( {

  onUpdate: getUpdate(),
  onState: onState
});

driver.state( 'alpha', [ 0, 100, 0 ] );
driver.state( 'idle', [ 300, 200, 0.5 ] );
driver.state( 'rollOver', [ 100, 200, 1 ] );
driver.state( 'omega', [ 0, 300, 0 ] );

driver.fromTo( 'alpha', 'idle', 0.5, animator );
driver.fromTo( 'idle', 'rollOver', 0.5, animator );
driver.fromTo( 'rollOver', 'idle', 0.5, animator );
driver.fromTo( 'idle', 'omega', 0.5, animator );

driver.init( 'alpha' );

driver.go( 'rollOver', function( value, state ) {

  console.log( '---- finished alpha -> rollOver', value );

  driver.go( 'omega', function( value ) {

    console.log( '---- finished rollOver -> omega', value );
  });
});

function onState( state ) {

  console.log( 'in state', state );
}


function animator( percentage, start, end ) {

  var rVal = [];

  start.forEach( function( startValue, i ) {

    var endValue = end[ i ];

    rVal[ i ] = ( endValue - startValue ) * percentage + startValue;
  });

  return rVal;
}

function getUpdate() {

  var onUpdate;

  try {

    var div = document.createElement( 'div' );

    div.style = 'absolute';

    document.body.appendChild( div );

    onUpdate = function( value, state ) {

      div.style.background = '#CAFE00';
      div.style.width = div.style.height = 100 + 'px';
      div.style.position = 'absolute';
      div.style.left = value[ 0 ] + 'px';
      div.style.top = value[ 1 ] + 'px';
      div.style.opacity = value[ 2 ];

      // console.log( value[ 2 ] );
    };
  } catch( e ) {

    onUpdate = function( value, state ) {

      console.log( 'state: ', state );
      console.log( 'value: ', value );
    };
  };

  return onUpdate;
}