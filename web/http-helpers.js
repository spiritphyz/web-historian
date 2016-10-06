var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.serveAssets = function(res, asset, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
  var extname = path.extname(asset);
  var contentType = 'text/html';

  switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  }

  fs.exists(asset, function(exists) {

    if (exists) {
      fs.readFile(asset, function(error, content) {
        if (error) {
          callback(res, error, 500);
        } else {       
          exports.headers['Content-Type'] = contentType;
          callback(res, content);
        }             
      });
    } else {
      // if this is a request for a website
      if (asset.indexOf('/www') !== -1) {
        // return loading.html
        fs.readFile('./web/public/loading.html', function(error, content) {
          if (error) {
            callback(res, error, 500);
          } else {       
            exports.headers['Content-Type'] = 'text/html';
            callback(res, content);
          }             
        });     
      // if not
      } else {
        // return 404
        exports.send404(res);
      }
    }
  });
  
};


// As you progress, keep thinking about what helper functions you can put here!
exports.respond = function(res, data, statusCode) {
  statusCode = statusCode || 200;

  res.writeHead(statusCode, exports.headers);
  res.end(data, 'utf-8');
};

exports.send404 = function(res) {
  exports.respond(res, 'Not Found', 404);
};

exports.handleGet = function(req, res) {

  var filePath = req.url;
  if (filePath.slice(0, 4) !== '/www') {
    if (filePath === '/') {
      filePath = '/index.html';
    }

    filePath = archive.paths.siteAssets + filePath;
  } else {
    filePath = archive.paths.archivedSites + filePath/* + '.html'*/;
  }

  exports.serveAssets(res, filePath, exports.respond);
  
};

exports.handlePost = function(req, res) {
  var website = '';

  var body = '';
  req.on('data', function(chunk) {

    website = chunk.toString().slice(4) + '\n';

    fs.appendFile(archive.paths.list, website, 'utf8', function(error) {
      if (error) {
        throw error;
      }
      exports.respond(res, website, 302);
    });
  });

};









