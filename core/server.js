/**
 * A simple http server
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */

var http = require('http');

// Class: a simple restful http server
var SimpleRestfulHttpServer;
exports.SimpleRestfulHttpServer = SimpleRestfulHttpServer = function(app, options) {
  // the port http server run on
  this.port = options.port || 8080;

  // debug flag
  this.debug = app.debug || false;

  // the app instance
  this.app = app;

  // inner http server
  var self = this;
  this._server = http.createServer(function(req, res) {
    self.log('get request: ' + req.method + ' ' + req.url);

    if(req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Length',
      });
      res.end();
      return;
    }

    // distribute requires to route rules
    self.app.router.distribute(req, res);
  });
};

// start the server
SimpleRestfulHttpServer.prototype.start = function() {
  this._server.listen(this.port);
};

// stop the server
SimpleRestfulHttpServer.prototype.stop = function(cb) {
  this._server.close(cb);
};

// a simple server logger
// for convinience, put with in this module
SimpleRestfulHttpServer.prototype.log = function(msg) {
  if(this.debug)
    console.log(msg);
};
