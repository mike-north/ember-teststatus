import Ember from 'ember';
import layout from '../templates/components/test-status';

const { Component, inject, A } = Ember;

export default Component.extend({
  layout,
  messages: null,
  teststatus: inject.service(),
  init() {
    this._super(...arguments);
    this.set('messages', new A([]));
  },
  didInsertElement() {
    this._super(...arguments);
    let eventName = `${this.get('elementId')}Message`;
    this.get('teststatus').on(eventName, this._logEvent.bind(this));
  },
  _logEvent(event) {
    this.get('messages').addObject(event.eventName);
  },
  actions: {
    frameLoaded(event) {
      let origin = 'http://localhost:4200';
      event.target.contentWindow.postMessage({
        eventName: 'setup',
        instanceId: this.get('elementId'),
        plugins: [{
          type: 'postmessage',
          origin
        }]
      }, origin);
    }
  }
});
