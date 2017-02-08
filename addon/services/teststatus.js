import Ember from 'ember';

const { Service, Evented } = Ember;

export default Service.extend(Evented, {
  init() {
    this._super(...arguments);
    this._setupPostMessageListener();
  },
  _setupPostMessageListener() {
    window.addEventListener('message', this._receiveMessage.bind(this), false);
  },
  _receiveMessage(event) {
    let origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== 'http://localhost:4200') {
      return;
    }
    if (event.data.instanceId) {
      this.trigger(`${event.data.instanceId}Message`, event.data);
    }
  }
});
