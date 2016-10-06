#!/usr/local/bin/node

// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

archive.readListOfUrls(function(data) {
  data.forEach(function(url) {
    archive.isUrlArchived(url, function(exists) {
      if (!exists) {
        archive.downloadUrls([url]);
        // do nothing
      }
    });
  });

});

fs.appendFile(path.join(__dirname, '../workers/watcher.log'), 'Added archived website at time ' + new Date() + '\n');

