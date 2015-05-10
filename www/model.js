/**
 * Demo models
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */
var Model = require('../core/model.js').Model;
var app = require('./app.js').app;
var _ = require('underscore');

// The user model
var User;
exports.User = User = app.createModel('User', {
  name: 'string',
  password: 'string',
  sexual: 'string',
});

User.load(function() {
  User.route('user.get', function(collection, req, res) {
    res.response(200, collection.json());
    return null;
  });

  User.route('user.post', function(collection, req, res) {
    var json = req.json;

    if(! _.isNull(req.ids[0])) {
      res.response(400);
      return ;
    }

    if(! json) {
      res.response(400);
      return ;
    }

    json.id = User.storage.content.length + 1;
    User.storage.content.push(json);
    User.save(function(err) {
      if(err) {
        res.response(500);
      } else {
        res.response(201);
      }
    });
  });

  User.route('user.put', function(collection, req, res) {
    var json = req.json;

    if(! json) {
      res.response(400);
      return ;
    }

    if(req.ids.length != 1 || _.isNull(req.ids[0])) {
      res.response(400);
      return ;
    }

    var i = 0;
    for(;i < User.storage.content.length;i ++) {
      if(User.storage.content[i]["id"] === req.ids[0]) {
        json.id = req.ids[0];
        User.storage.content[i] = json;

        User.save(function(err) {
          if(err) {
            res.response(500);
          } else {
            res.response(201);
          }
        });

        return ;
      }
    }

    res.response(500);
  });

  User.route('user.delete', function(collection, req, res) {
    var i = 0;
    for(;i < User.storage.content.length;i ++) {
      if(User.storage.content[i]["id"] === req.ids[0]) {
        User.storage.content = User.storage.content.slice(0, i).concat(User.storage.content.slice(i + 1));

        User.save(function(err) {
          if(err) {
            res.response(500);
          } else {
            res.response(204);
          }
        });

        return ;
      }
    }

    res.response(500);
  });
});
