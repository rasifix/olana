/* global $ */

import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    return $.get('http://localhost:8080/api/event').then(function(data) { 
      return data.events;
    });
  },
  
  actions: {
    eventClicked: function(id) {
      this.transitionTo('event', id);
    }
  }

});
