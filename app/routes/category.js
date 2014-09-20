/* global $, ENV */

import Ember from 'ember';
import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
  
  model: function(params) {
    var eventId = this.modelFor('event').id;
    var id = params['category_id'];
    var url = ENV.APP.API_HOST + 'api/events/' + eventId + '/classes/' + id;
    return $.get(url).then(function(data) { 
      return parseRanking(data);
    });
  },
  
  actions: {
    error: function(error) {
      console.log(error);
      this.transitionTo('categories');
    },
    onlegclick: function(leg) {
      this.transitionTo('leg', leg.leg);
    }
  }

});