var directions = require( 'directions' ),
    rafLoop = require( 'raf-loop' ),
    noop = require( 'no-op' );

module.exports = kimi;

function kimi( settings ) {

  if( !( this instanceof kimi) ) {

    return new kimi( settings );
  }

  settings = settings || {};
  this.onUpdate = settings.onUpdate || noop;
  this.onState = settings.onState || noop;

  this.directions = directions();
  this.animator = {};
  this.states = {};
  this.cTime = 0;
  this.cDuration = 0;
  this.cState = null;
  this.tState = null;
  this.cPath = null;
  this.cPathIdx = 0;
  this.cAnimator = null;
  this.cOnComplete = null;
  this.engine = rafLoop( tick.bind( this ) );
}

kimi.prototype = {

  state: function( name, value ) {

    this.states[ name ] = value;
  },

  fromTo: function( from, to, duration, animator ) {

    this.directions.fromTo( from, to, duration );

    setAnimator.call( this, from, to, animator );
  },

  init: function( initState ) {

    setCurrentState.call( this, initState );
  },

  go: function( to, onComplete ) {

    if( this.cState ) {

      if( this.cState != to ) {
        
        this.cOnComplete = onComplete || noop;

        this.cPath = this.directions.getPath( this.cState, to ).path;
        this.cPathIdx = 0;

        if( this.cState != this.cPath[ 0 ] || this.tState != this.cPath[ 1 ] ) {

          setFromTo.call( this, this.cPath[ 0 ], this.cPath[ 1 ] );

          this.cTime = 0;
          
          this.engine.start();
        }
      }
    } else {

      throw new Error( 'call init with your initial state before calling go' );
    }
  }
};

function setFromTo( from, to ) {

  setCurrentState.call( this, from );
  this.tState = to;
  this.cDuration = this.directions.fromTo( from, to ) * 1000;
  this.cAnimator = this.animator[ from ][ to ];
}

function tick( delta ) {

  this.cTime += delta;

  var percentage = this.cTime / this.cDuration,
      value;

  if( percentage >= 1 ) {

    this.cPathIdx++;

    if( this.cPathIdx < this.cPath.length - 1 ) {

      setFromTo.call( this, this.cPath[ this.cPathIdx ], this.cPath[ this.cPathIdx + 1 ] );

      percentage = ( percentage - 1 );
      this.cTime = percentage * this.cDuration;

      this.onUpdate( this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] ), this.cState );
    } else {

      percentage = 1;
      this.cTime = this.cDuration;
      this.engine.stop();

      value = this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] );

      setCurrentState.call( this, this.tState );
      this.cOnComplete( value, this.cTime );
    }
  } else {

    this.onUpdate( this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] ), this.cState );
  }
}

function setCurrentState( state ) {

  if( this.cState != state ) {
    
    this.cState = state;
    this.onUpdate( this.states[ state ], state );
    this.onState( this.states[ state ], state );
  }
}

function setAnimator( from, to, animator ) {

  var animators = this.animator[ from ] || ( this.animator[ from ] = {} );

  animators[ to ] = animator;
}