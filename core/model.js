/**
 * A model of RESTful framework
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */
var SimpleJsonStorageBackend = require('./storage.js').SimpleJsonStorageBackend;
var _ = require('underscore');

// Class: Collection
// Collection of same model
var Collection;
exports.Collection = Collection = function(model) {
  this.items = [];
};

// add items
Collection.prototype.add = function(items) {
  if(! _.isArray(items)) {
    items = [items];
  }

  var i;
  for(i = 0;i < items.length;i ++) {
    this.items.push(items[i]);
  }
};

// to json
Collection.prototype.json = function() {
  return JSON.stringify(this.items);
};

// Class: Model
// don't use constructor directly, use app.createModel
var Model;
exports.Model = Model = function(app, name, schema, options) {
  // the name of this model
  this.name = name;

  // the app this model belong to
  this.app = app;

  this.schema = schema;

  // the backend
  this.storageClass = options.storageClass || SimpleJsonStorageBackend;
  this.storage = new this.storageClass(this, app);
};

// add route to this model
Model.prototype.route = function(routeName, callback) {
  this.app.router.route(this, routeName, callback);
};

// some previous work before route to user app
Model.prototype._preWrap = function(resource, id, req, res) {
  var ret = new Collection(this);

  if(! id) {
    ret.add(this.storage.content);
    return ret;
  }

  var i = 0;
  for(i = 0;i < this.storage.content.length;i ++)
    if(this.storage.content[i].id === id) {
      ret.add(this.storage.content[i]);
      return ret;
    }

  // id not found
  res.response(404);
  return null;
};

// some short cuts
Model.prototype.save = function(callback) {
  // save the model
  this.storage.dump(callback);
};

Model.prototype.load = function(callback) {
  // load the model
  this.storage.load(callback);
};
