/**
 * The demo application
 *
 * @author rapidhere@gmail.com
 * @version v0.1
 */

var Application = require('../core/application.js').Application;
var path = require('path');

var app = new Application({
  debug: true,
  dataDirectory: path.join(__dirname, '..', 'data'),
});

exports.app = app;

require('./model.js');
