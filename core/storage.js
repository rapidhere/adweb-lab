/**
 * The storage backend of model
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */
var inherits = require('util').inherits;
var fs = require('fs');
var path = require('path');

// the base abstract storage backend
var StorageBackend;
exports.StorageBackend = StorageBackend = function(model, app) {
  // the content, can access by other
  this.content = [];

  // the debug flag
  this.debug = app.debug;

  // the model associate with this backend
  this.mode = model;
};

// load content from storage
StorageBackend.prototype.load = function(cb) {
  // do nothing
};

// dump content to storage
StorageBackend.prototype.dump = function(cb) {
  // do nothing
};

// A simple storage backend store content as json
var SimpleJsonStorageBackend;
exports.SimpleJsonStorageBackend = SimpleJsonStorageBackend = function(model, app) {
  StorageBackend.call(this, model, app);

  // get the data dir
  this.dataDirectory = app.dataDirectory;

  // the file name
  this.fileName = path.join(this.dataDirectory, model.name + '.json-storage');
};
inherits(SimpleJsonStorageBackend, StorageBackend);

SimpleJsonStorageBackend.prototype.load = function(callback) {
  var self = this;
  fs.readFile(this.fileName, {encoding: 'utf8'}, function(err, data) {
    if(err) {
      // no such file
      if(err.errno == 34) {
        self.content = [];
        callback(null, self);
      } else {
        callback(err);
      }

      return ;
    }

    // forward data
    self.content = JSON.parse(data);
    callback(null, self);
  });
};

SimpleJsonStorageBackend.prototype.dump = function(callback) {
  var self = this;
  fs.writeFile(this.fileName, JSON.stringify(this.content), {encoding: 'utf8'}, function(err) {
    if(err)
      callback(err);
    else
      callback(null);
  });
}
