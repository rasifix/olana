/* global $, ENV */

import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    return $.get(ENV.APP.API_HOST + 'api/events').then(function(data) { 
      return data.events;
    });
  },
  
  actions: {
    eventClicked: function(id) {
      this.transitionTo('event', id);
    }
  }

});
