/**
 * Router Module
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */

var _ = require('underscore');

// Class: Router
var Router;
exports.Router = Router = function(app) {
  // debug flag
  this.debug = app.debug || false;

  // app instance
  this.app = app;

  // The router map
  this.routerMap = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
  };
};

// Class: Request
// A simple wrapper for raw Request of node
// For inner usage
var Request;
exports.Request = Request = function(options) {
  // the app
  this.app = options.app;

  // the raw request object
  this.rawRequest = options.req;

  // some meta info
  this.url = options.req.url;
  this.action = options.req.method;
  this.ids = [];
  this.resources = [];
  this.model = [];

  this.body = '';
  this.bodyEnded = false;
  this.bodyEndCb = null;

  this.rawRequest.on('data', _.bind(function(data) {
    this.body += data;
  },this));

  this.rawRequest.on('end', _.bind(function() {
    this.bodyEnded = true;

    if(this.bodyEndCb) {
      this.bodyEndCb(this.body);
    }
  }, this));

  // the json
  this.json = null;
};

Request.prototype.readBody = function(callback) {
  if(this.bodyEnded)
    callback(this.body);
  else {
    this.bodyEndCb = callback;
  }
};

// Class: Response
// A simple wrapper for raw Response of node
var Respnse;
exports.Response = Response = function(options) {
  // the app
  this.app = options.app;

  // the raw request object
  this.rawResponse = options.res;

  // has responsed?
  this.responsed = false;
};

Response.prototype.response = function(statusCode, data, callback) {
  if(! _.isNumber(statusCode)) {
    data = statusCode;
    statusCode = 200;
  }

  data = data || '';

  this.rawResponse.writeHead(statusCode, {
    'Content-Length': data.length,
    'Content-Type': 'application/json',
    'Connection': 'close',
    'Access-Control-Allow-Origin': '*',
  });

  if(callback)
    this.rawResponse.end(data, callback);
  else
    this.rawResponse.end(data);

  this.responsed = true;
};

// Add a route rule to the router
// callback: (collection, req, res)
Router.prototype.route = function(model, routeName, callback) {
  // TODO: we just support one name resource now
  var t = routeName.split('.');

  var resouces = [t[0]];
  var methods = _.rest(t, 1);
  if(! methods)
    methods = ['GET', 'PUT', 'POST', 'DELETE'];

  var _name = this.connectResourceNames(resouces);

  var self = this;
  methods.forEach(function(method) {
    method = method.toUpperCase();
    // simply ignored
    if(_.indexOf(['GET', 'PUT', 'POST', 'DELETE'], method) == -1) {
      return ;
    }

    self.routerMap[method][_name] = {
      callback: callback,
      model: model
    };
  });

  return;
};

// Connect resources name
Router.prototype.connectResourceNames = function(resources) {
  var ret = '';
  var i;
  for(i = 0;i < resources.length;i ++)
    ret += resources[i] + ';';

  return ret;
};

// Distribute the access to the routes
Router.prototype.distribute = function(_req, _res) {
  var req = new Request({
    req: _req,
    app: this.app,
  });

  var res = new Response({
    res: _res,
    app: this.app,
  });

  // read body in
  req.readBody(_.bind(function() {
    // set json
    if(req.body)
      req.json = JSON.parse(req.body);

    var table = this.routerMap[req.action];
    // cannot find route table of this action
    if(_.isUndefined(table)) {
      res.response(405); // method not allowed
      return;
    }

    // parse url
    var pattern = /^(?:(\/.+?\/)(\d+\/)?).*$/;
    var url = req.url;
    if(url[url.length - 1] != '/')
      url += '/';

    var resources = [];
    var ids = [];
    var ret;

    while(true) {
      ret = url.match(pattern);
      if(! ret) {
        res.response(400); // bad request
        return ;
      }

      url = url.substr(ret[1].length + (ret[2] ? ret[2].length : 0));

      resources.push(ret[1].substr(1, ret[1].length - 2));
      if(ret[2])
        ids.push(parseInt(ret[2]));
      else {
        if(url) {
          res.response(400); // bad request
          return ;
        }
        ids.push(null);
      }

      if(! url)
        break;
    }

    // find router
    var name = this.connectResourceNames(resources);
    var entry = table[name];

    // no such entry
    if(! entry) {
      res.response(404);
      return ;
    }

    // get entry
    var callback = entry.callback;
    var model = entry.model;

    // pre wrap the collection
    var collection = model._preWrap(resources[0], ids[0], req, res);
    if(! collection) {
      return;
    }

    // add meta info
    req.ids = ids;
    req.resources = resources;
    req.model = model;

    // call the cb
    callback(collection, req, res);
  }, this)); // read body
};
