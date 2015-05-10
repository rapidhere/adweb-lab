/**
 * A RESTful app
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */
var Router = require('./router.js').Router;
var Model = require('./model.js').Model;

// Class Application
var Application;
exports.Application = Application = function(options) {
  // debug flag
  this.debug = options.debug || false;

  // inner router
  this.router = new Router(this);

  // model list
  this.models = {};

  this.dataDirectory = options.dataDirectory;
};

// create a model for this application
Application.prototype.createModel = function(name, schema, options) {
  var model = new Model(this, name, schema, options || {});

  this.models[name] = model;

  return model;
};

// a simple logger
Application.prototype.log = function(msg) {
  if(this.debug)
    console.log(msg);
};
