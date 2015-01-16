var directions = require( 'directions' ),
    rafLoop = require( 'raf-loop' ),
    noop = require( 'no-op' );

module.exports = kimi;

function kimi() {

  if( !( this instanceof kimi) ) {

    return new kimi();
  }

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
  this.cGoWith = null;
  this.cOnState = null;
  this.cOnComplete = null;
  this.engine = rafLoop( tick.bind( this ) );
}

kimi.prototype = {

  state: function( name, value ) {

    this.cState = this.cState || name;
    this.states[ name ] = value;
  },

  fromTo: function( from, to, duration, animator ) {

    this.directions.fromTo( from, to, duration );

    setAnimator.call( this, from, to, animator );
  },

  go: function( to, goWith, onState, onComplete ) {

    this.cGoWith = goWith || noop;
    this.cOnState = onState || noop;
    this.cOnComplete = onComplete || noop;

    this.cPath = this.directions.getPath( this.cState, to ).path;
    this.cPathIdx = 0;

    if( this.cState != this.cPath[ 0 ] || this.tState != this.cPath[ 1 ] ) {

      setFromTo.call( this, this.cPath[ 0 ], this.cPath[ 1 ] );

      this.cTime = 0;
      
      this.engine.start();
    }
  }
};

function setFromTo( from, to ) {

  this.cState = from;
  this.tState = to;
  this.cDuration = this.directions.fromTo( from, to ) * 1000;
  this.cAnimator = this.animator[ from ][ to ];

  this.cOnState( from );
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

      this.cGoWith( this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] ), this.cTime );
    } else {

      percentage = 1;
      this.cTime = this.cDuration;
      this.engine.stop();

      value = this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] );

      this.cState = this.tState;
      this.cOnState( this.tState );
      this.cGoWith( value, this.cTime );
      this.cOnComplete( value, this.cTime );
    }
  } else {

    this.cGoWith( this.cAnimator( percentage, this.states[ this.cState ], this.states[ this.tState ] ), this.cTime );
  }
}

function setAnimator( from, to, animator ) {

  var animators = this.animator[ from ] || ( this.animator[ from ] = {} );

  animators[ to ] = animator;
}