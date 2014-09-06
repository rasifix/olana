/* global $ */

import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function(params) {
    var id = params['event_id'];
    return $.get('http://localhost:8080/api/event/' + id);
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('category', name);
    },
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
