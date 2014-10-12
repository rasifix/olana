/* global $, ENV */

import Ember from 'ember';

export default Ember.Route.extend({
  
  events: null,
  
  model: function() {
    if (this.events) {
      return this.events;
    }
    var that = this;
    return $.get(ENV.APP.API_HOST + 'api/events').then(function(data) { 
      that.events = data.events;
      return data.events;
    });
  },
  
  actions: {
    eventClicked: function(id) {
      this.transitionTo('event', id);
    }
  }

});
