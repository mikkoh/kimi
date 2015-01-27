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
  this.allowReverse = settings.allowReverse || true;

  this.directions = directions();
  this.animator = {};
  this.states = {};
  this.isReversing = false;
  
  this.cTime = 0;
  this.cDuration = 0;
  this.cState = null;
  this.tState = null;
  this.cPath = [];
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

      this.cOnComplete = onComplete || noop;

      // if we're trying to go to our current state
      if( to == this.cState ) {

        // if we allow for reversing then we should reverse
        if( this.allowReverse ) {

          this.isReversing = true;
          this.cPath = [ this.cState, this.tState ];
          this.tState = null;

        // otherwise we'll get a path from our tState
        } else {

          this.isReversing = false;
          this.cPath = this.directions.getPath( this.cState, this.tState, to ).path;
          this.tState = null;
        }
      // if we're not going to our current state then just get the path
      } else {

        this.isReversing = false;
        this.cPath = this.directions.getPath( this.cState, to ).path;
        this.tState = null;
      }

      setFromTo.call( this );

      this.engine.start();
    } else {

      throw new Error( 'call init with your initial state before calling go' );
    }
  }
};

function setFromTo() {

  var from, to; 

  if( this.tState ) {

    from = this.tState;
    to = this.cPath.shift();
  } else {

    from = this.cPath.shift();
    to = this.cPath.shift();
  }

  // if we have a to state
  if( to ) {

    setCurrentState.call( this, from );
    this.tState = to;
    this.cDuration = this.directions.fromTo( from, to ) * 1000;
    this.cAnimator = this.animator[ from ][ to ];
  } else {

    this.cTime = 0;

    if( !this.isReversing ) {

      setCurrentState.call( this, this.tState );
    } else {

      setCurrentState.call( this, this.cState );
    }

    this.tState = null;
    this.cDuration = 0;
  }
}

function tick( delta ) {

  var value;

  if( !this.isReversing ) {

    this.cTime += delta;
  } else {

    this.cTime -= delta;
  }

  // if we're not reversing then just call the animator or go to the next state
  if( !this.isReversing ) {

    if( this.cTime >= this.cDuration ) {

      this.cTime = this.cTime - this.cDuration;

      setFromTo.call( this );

      if( !this.tState ) {

        this.engine.stop();
        this.cTime = 0;
      }
    }
  // if we're reversing
  } else {

    if( this.cTime <= 0 ) {

      setFromTo.call( this );
      
      if( !this.tState ) {

        this.engine.stop();
        this.cTime = 0;
      }
    }
  }

  if( this.tState ) {

    this.onUpdate( 
                    this.cAnimator( this.cTime / this.cDuration, this.states[ this.cState ], this.states[ this.tState ] ), 
                    this.cState, 
                    this.cTime 
                  );
  } else {

    value = this.cAnimator( 0, this.states[ this.cState ], this.states[ this.cState ] );

    this.onUpdate( value, this.cState, this.cTime );
    this.cOnComplete( value, this.cState );
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