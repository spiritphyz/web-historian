var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    if (err) {
      console.error(error);
    } else {
      callback(data.split('\n'));
    }
  });
};

exports.isUrlInList = function(target, callback) {
  exports.readListOfUrls(function(content) {
    var exists = content.indexOf(target) > -1;
    callback(exists);
  });
};

exports.addUrlToList = function(websiteToAdd, callback) {
  fs.appendFile(exports.paths.list, websiteToAdd, 'utf8', function(error) {
    if (error) {
      throw error;
    }
    callback();
  });
};

exports.isUrlArchived = function(target, callback) {
  fs.exists(exports.paths.archivedSites + '/' + target, function(exists) {
    callback(exists);
  });
};

exports.downloadUrls = function(array) {

  array.forEach(function(url) {
    var dest = exports.paths.archivedSites + '/' + url;
    // var file = fs.createWriteStream(dest);
    var options = {
      host: url,
      port: 80,
      path: ''
    };

    var request = http.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });

      response.on('end', function() {
        fs.writeFile(dest, body, function(error) {
          if (error) {
            return console.log('file weite error: ', error);
          }
        });
      });

    });

  });

};
