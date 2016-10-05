var path = require('path');
var archive = require('../helpers/archive-helpers');
var utils = require('./http-helpers.js');
var fs = require('fs');
// require more modules/folders here!

var actions = {
  'GET': function(req, res) {
    console.log('serving a GET request on ' + req.url);

    utils.handleGet(req, res);
  },
  'POST': function(req, res) {

  }
};


exports.handleRequest = function(req, res) {
  var action = actions[req.method];
  action ? action(req, res) : utils.send404(res);
};

// exports.handleRequest = function (req, res) {
//   var headers = utils.headers;

//   res.writeHead(200, headers);
//   res.end(archive.paths.list);
// };
