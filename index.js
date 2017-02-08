/* eslint-env node */
/* eslint no-var:0, object-shorthand:0, prefer-template:0*/
'use strict';

var path = require('path');

module.exports = {
  name: 'ember-teststatus',

  _findQUnitEventsPath: function() {
    if (!this._qunitEventsPath) {
      var resolve = require('resolve');

      this._qunitEventsPath = resolve.sync('qunit-events');
      this._qunitEventsDir = path.dirname(this._qunitEventsPath);
    }
  },

  treeForVendor: function(tree) {
    var Funnel = require('broccoli-funnel');
    var MergeTrees = require('broccoli-merge-trees');

    this._findQUnitEventsPath();

    var qunitEventsTree = new Funnel(this._qunitEventsDir, {
      files: [path.basename(this._qunitEventsPath)],
      destDir: '/qunit-events'
    });
    
    var trees = [
      tree
      // tree is not always defined, so filter out if empty
    ].filter(Boolean);
    if (this.app.tests) {
      trees.push(qunitEventsTree);
    }
    return new MergeTrees(trees, {
      annotation: 'ember-teststatus: treeForVendor'
    });
  },

  included: function included(app, addon) {
    this.app = app || addon;

    var opts = { enabled: this.app.tests };
    if (opts.enabled) {
      this._findQUnitEventsPath();

      app.import('vendor/qunit-events/' + path.basename(this._qunitEventsPath), {
        type: 'test'
      });
    }
  }
};
