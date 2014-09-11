/* global $ */

import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function(params) {
    var id = params['event_id'];
    return $.get(ENV.APP.API_HOST + 'api/events/' + id);
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
