var Graph = require('node-dijkstra');

module.exports = function() {

  var costs = {};

  return {

    getPath: function(startState) {

      var args = arguments;
      var tempnode = typeof startState === 'object' && startState.from + '_' + startState.to;
      var path;
      var graph;
      var pathPart;
      var i;

      // since this is a complex start 
      // add a the tempnode to costs
      if(tempnode) {
        costs[ tempnode ] = {};
        costs[ tempnode ][ startState.from ] = startState.location;
        costs[ tempnode ][ startState.to ] = costs[ startState.from ][ startState.to ] - startState.location;

        graph = new Graph(costs);

        path = graph.shortestPath(tempnode, args[ 1 ]);
        path.shift(); // remove the temp node

        for(i = 2; i < args.length; i++) {
          pathPart = graph.shortestPath(args[ i - 1 ], args[ i ]);
          pathPart.shift();

          path = path.concat(pathPart);
        }

        delete costs[ tempnode ];
      } else {

        graph = new Graph(costs);

        path = [];

        path = graph.shortestPath(startState, args[ 1 ]);

        for(i = 2; i < args.length; i++) {
          pathPart = graph.shortestPath(args[ i - 1 ], args[ i ]);
          pathPart.shift();

          path = path.concat(pathPart);
        } 
      }

      return path;
    },

    fromTo: function(from, to, duration) {

      if(duration === undefined) {
        return costs[ from ][ to ];
      } else {
        if(!costs[ from ]) {
          costs[ from ] = {};
        }

        costs[ from ][ to ] = duration;
      }
    }
  };
};