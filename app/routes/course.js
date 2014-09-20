/* global $ */

import Ember from 'ember';
import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
    
  model: function(params) {
    var eventId = this.modelFor('event').id;
    var id = params['course_id'];
    var url = ENV.APP.API_HOST + 'api/events/' + eventId + '/courses/' + id;
    return $.get(url).then(function(data) { 
      return parseRanking(data);
    }, function(error) {
      console.log('freaaaking error! ');
      console.log(error);
    });
  },
  
  actions: {
    onlegclick: function(leg) {
      this.transitionTo('leg', leg.leg);
    },
    error: function(error) {
      console.log('errrrroarrrrr!');
      console.log(error);
    }
  }
  
});