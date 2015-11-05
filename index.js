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

  if(!settings.manualStep) {
    this.engine = rafLoop(this.step.bind(this));  
  }
}

kimi.prototype = {

  state: function(name, value) {

    this.states[ name ] = value;
  },

  fromTo: function(from, to, duration, animator) {

    if(arguments.length < 4) {
      throw new Error('incorrect amount of arguments sent when defining fromTo');
    }

    this.directions.fromTo(from, to, duration);

    setAnimator.call(this, from, to, animator);
  },

  init: function(state) {

    this.currentState = state;

    sendUpdate.call(this);
  },

  set: function(state) {

    var setToTarget;

    if(this.currentPath.length > 0) {
      setToTarget = this.currentPath[ this.currentPath.length - 1 ] === state;
    } else {
      setToTarget = this.targetState === state;
    }

    this.currentState = state;
    this.currentTime = 0;
    this.targetState = null;
    this.currentPath = [];

    if(this.engine) {
      this.engine.stop();
    }
    
    sendUpdate.call(this);

    if(setToTarget && this.onComplete) {
      this.onComplete( 
        this.states[ state ],
        state
      );
    }

    this.onComplete = null;
  },

  go: function(to, onComplete) {

    // this is to check if init has been called
    if(this.currentState) {

      this.onComplete = onComplete || noop;

      // we want to check that this to will not be going to the to state already
      // this check will ensure that the path is not recalculated
      if(this.currentPath.length === 0 || this.currentPath[ this.currentPath.length - 1 ] !== to) {

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

        if(this.currentPath === null) {
          throw new Error('It is not possible to go from ' + this.currentState + ' to ' + to);
        } else if(!this.targetState) {
          // check if we're at the current state then we can
          // simply remove ourselves
          if(this.currentTime === 0) {
            this.currentPath.shift();
          }
          
          this.targetState = this.currentPath[ 0 ];
        }

        if(this.engine) {
          this.engine.start();  
        }
      }
    } else {

      throw new Error('call init with your initial state before calling go');
    }
  },

  destroy: function() {
    if(this.engine) {
      this.engine.stop();
    }

    // kill the engine
    this.engine = null;

    // this is a bit heavy handed but it ensures
    // that no one can do anything with the ui instance
    // anymore
    this.step = function() {};
  },

  step: function(delta) {

    if(this.currentPath.length || this.targetState) {

      var to = this.currentPath[ 0 ];
      var isReversing = this.allowReverse && (this.currentState === to || ( this.targetState && to && to !== this.targetState ));
      var duration = this.directions.fromTo(this.currentState, this.targetState) * 1000;
      var animator = this.animator[ this.currentState ][ this.targetState ];

      // we should reverse when we're trying to go from to the same place
      // or when the state we're going to isn't the same as the path to
      if(isReversing) {

        this.currentTime = Math.max(this.currentTime - delta, 0);

        if(this.currentTime === 0) {

          // this will send an update with the current state object
          // by reference
          sendUpdate.call(this, duration);

          // we were reversing to the same state
          if(this.currentState === to) {

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

        if(this.currentTime === duration) {

          this.currentTime = 0;
          this.currentState = this.currentPath.shift();
          this.targetState = this.currentPath[ 0 ];

          sendUpdate.call(this, duration);
        } else {

          sendUpdate.call(this, duration, animator);
        }
      }

      // we don't have anywhere to go anymore
      if(this.currentPath.length === 0) {

        if(this.engine) {
          this.engine.stop();
        }
        
        this.onComplete( 
          this.states[ this.currentState ],
          this.currentState
        );
      }
    }
  }
};

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