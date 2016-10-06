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

exports.serveAssets = function(res, asset, callback, website) {
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
      if (      
        website.indexOf('.com') !== -1 ||
        website.indexOf('.org') !== -1 ||
        website.indexOf('.edu') !== -1 ||
        website.indexOf('.io') !== -1 ||
        website.indexOf('.net') !== -1) {
        // return loading.html
        fs.readFile(archive.paths.siteAssets + '/loading.html', function(error, content) {
          if (error) {
            callback(res, error, 500);
          } else {       
            exports.headers['Content-Type'] = 'text/html';
            callback(res, content);
            // is urlinlist? 
            archive.isUrlInList(website, function(exists) {
              // yes: wait for worker
              // no:  addurltolist with website asset
              if (!exists) {
                archive.addUrlToList(website + '\n', function() {
                  console.log('added ' + website + ' to sites.txt');
                });  
              }
            });
          }             
        });     
      }
    }
  });
  
};


// As you progress, keep thinking about what helper functions you can put here!
exports.respond = function(res, data, statusCode) {
  statusCode = statusCode || 200;

  var headers = exports.headers;
  if (statusCode === 301) {
    headers.location = 'http://127.0.0.1:8080/' + data;
  }

  res.writeHead(statusCode, headers);
  res.end(data, 'utf-8');
};

exports.send404 = function(res) {
  exports.respond(res, 'Not Found', 404);
};

exports.handleGet = function(req, res) {

  var filePath = req.url;
  /* eslint-disable */
  if (filePath.slice(0, 4) !== '/www' && 
      filePath.indexOf('.com') === -1 &&
      filePath.indexOf('.org') === -1 &&
      filePath.indexOf('.edu') === -1 &&
      filePath.indexOf('.io')  === -1 &&
      filePath.indexOf('.net') === -1
  /* eslint-enable */
    ) {
    if (filePath === '/') {
      filePath = '/index.html';
    }

    filePath = archive.paths.siteAssets + filePath;
  } else {
    filePath = '/' + req.url.slice(6);

    filePath = archive.paths.archivedSites + filePath/* + '.html'*/;
  }

  exports.serveAssets(res, filePath, exports.respond, req.url.slice(6));
  
};

exports.handlePost = function(req, res) {
  var website = '';

  req.on('data', function(chunk) {

    website = chunk.toString().slice(4) + '\n';

    archive.addUrlToList(website, function() {
      exports.respond(res, website, 301);
    });  

  });

};









