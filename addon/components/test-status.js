import Ember from 'ember';
import layout from '../templates/components/test-status';
import QUnitEventsClient from 'qunit-events/client';
const { Component } = Ember;

export default Component.extend({
  layout,
  didInsertElement() {
    this._super(...arguments);
    this.qunitEventsClient = new QUnitEventsClient({
      testUrl: 'http://localhost:4200/tests'
    });
  },
  didRender() {
    this._super(...arguments);
    this.qunitEventsClient.setupTestFrame(this.element);
  }
});
