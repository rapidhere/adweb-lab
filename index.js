/**
 * The demo web entry
 *
 * @author rapidhere@gmail.com
 * @version 0.1
 */
var Server = require('./core/server.js').SimpleRestfulHttpServer;
var app = require('./www/app.js').app;

var server = new Server(app, {
  port: 8080
});
server.start();

console.log('Demo server started, press CTRL-C to stop\n');

process.on('SIGINT', function() {
  server.stop(function() {
    console.log('Demo server stopped');
    process.exit(0);
  });
});
