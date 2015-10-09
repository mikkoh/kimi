var webdriverio = require('webdriverio');
var budo = require('budo');
var runTest = require('./runTest');

// if we're running in sauce labs
if(true || process.env.SAUCE_USERNAME) {

  var hasExited = false;
  var client;

  budo(__dirname + '/runTest.js', {
    live: false,
    port: 8000,
  })
  .on('connect', function(info) {
    var options = { 
                    desiredCapabilities: { 
                      browserName: 'chrome',
                      version: '27.0',
                      platform: 'XP',
                      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
                      name: 'integration',
                      build: process.env.TRAVIS_BUILD_NUMBER
                    } 
                  };
                  
    client = webdriverio.remote(options);
     
    client
    .init()
    .url(info.uri)
    .then(getLogs);

    function getLogs() {
      client
      .log('browser')
      .then( function(info) {

        console.log('got logs', info);

        info.value.forEach( function(message) {
          switch(message.level) {
            case 'INFO':
              console.log(message.message);

              var okEnd = /# ok/g
              var notOkEnd = /# fail/g;

              if(okEnd.test(message.message)) {
                endTest(0);
              } else if(notOkEnd.test(message.message)) {
                endTest(1);
              }
            break;

            case 'WARNING':
              // console.warn(message.message);
            break;

            case 'SEVERE':
              console.log(message.message);

              endTest(1);
            break;
          };
        });

        getLogs();
      })
      .catch( function(message) {
        console.log(error);

        endTest(1);
      });
    }
  }); 

  function endTest(exitCode) {
    hasExited = true;

    client
    .end()
    .then(function() {
      process.exit(exitCode);
    });
  }
} else {
  runTest();
}