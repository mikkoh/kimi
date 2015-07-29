var pathfinder = require('./pathfinder');
var rafLoop = require('raf-loop');
var noop = require('no-op');

module.exports = kimi;

function kimi(settings) {

  if(!( this instanceof kimi)) {

    return new kimi(settings);
  }

  settings = settings || {};
  this.onUpdate = settings.onUpdate || noop;
  this.onState = settings.onState || noop;
  this.allowReverse = settings.allowReverse || true;

  this.directions = pathfinder();
  this.animator = {};
  this.states = {};
  
  this.currentTime = 0;
  this.currentState = null;
  this.targetState = null;
  this.currentPath = [];
  this.onComplete = null;
  this.engine = rafLoop(tick.bind(this));
}

kimi.prototype = {

  state: function(name, value) {

    this.states[ name ] = value;
  },

  fromTo: function(from, to, duration, animator) {

    this.directions.fromTo(from, to, duration);

    setAnimator.call(this, from, to, animator);
  },

  init: function(initState) {

    this.currentState = initState;

    sendUpdate.call(this);
  },

  go: function(to, onComplete) {

    if(this.currentState) {

      this.onComplete = onComplete || noop;

      // if we're trying to go to our current state
      if(to === this.currentState) {

        if(!this.allowReverse) {

          this.currentPath = this.directions.getPath(this.currentState, this.targetState, to).path;
          this.currentPath.shift();
        } else {

          this.currentPath = [ to ];
        }
      // if we're not going to our current state then just get the path
      } else {

        if(this.targetState && this.currentState !== this.targetState) {

          this.currentPath = this.directions.getPath( {
            from: this.currentState,
            to: this.targetState,
            location: this.currentTime / 1000 
          }, to);
        } else {

          this.currentPath = this.directions.getPath( this.currentState, to);
        }
      }

      if(!this.targetState) {

        this.targetState = this.currentPath[ 0 ];
      }

      this.engine.start();
    } else {

      throw new Error('call init with your initial state before calling go');
    }
  }
};

function tick(delta) {

  var to = this.currentPath[ 0 ],
      isReversing = this.allowReverse && (this.currentState == to || ( this.targetState && to && to != this.targetState )),
      duration = this.directions.fromTo(this.currentState, this.targetState) * 1000,
      animator = this.animator[ this.currentState ][ this.targetState ];

  // we should reverse when we're trying to go from to the same place
  // or when the state we're going to isn't the same as the path to
  if(isReversing) {

    this.currentTime = Math.max(this.currentTime - delta, 0);

    if(this.currentTime === 0) {

      // this will send an update with the current state object
      // by reference
      sendUpdate.call(this, duration);

      // we were reversing to the same state
      if(this.currentState == to) {

        // we've reached our target state which is the current state
        this.targetState = this.currentPath.shift();
      // we were reversing cause we need to go to a new state
      } else if(to != this.targetState) {
          
        // now allow it to go to the target state
        this.targetState = to;
      }
    } else {

      // send an update that is calculated
      sendUpdate.call(this, duration, animator);
    }
  } else {

    this.currentTime = Math.min(this.currentTime + delta, duration);

    

    if(this.currentTime == duration) {

      this.currentTime = 0;
      this.currentState = this.targetState;
      this.targetState = this.currentPath.shift();

      sendUpdate.call(this, duration);
    } else {

      sendUpdate.call(this, duration, animator);
    }
  }

  // we don't have anywhere to go anymore
  if(this.currentState == this.targetState && this.currentPath.length === 0) {

    this.engine.stop();
    
    this.onComplete( 
      this.states[ this.currentState ],
      this.currentState
    );
  }
}

function sendUpdate(duration, animator) {

  if(animator) {

    this.onUpdate( 
      animator(this.currentTime / duration, this.states[ this.currentState ], this.states[ this.targetState ]), 
      this.currentState, 
      this.currentTime 
    );
  } else {

    this.onUpdate( 
      this.states[ this.currentState ], 
      this.currentState, 
      this.currentTime 
    );

    this.onState( 
      this.states[ this.currentState ], 
      this.currentState, 
      this.currentTime
    );
  }
}


function setAnimator(from, to, animator) {

  var animators = this.animator[ from ] || (this.animator[ from ] = {});

  animators[ to ] = animator;
}