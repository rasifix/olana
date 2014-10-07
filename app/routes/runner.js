/* global $ */

import Ember from 'ember';

export default Ember.Route.extend({
    
  model: function(params) {
    var id = params['id'];
    var url = ENV.APP.API_HOST + 'api/runners/' + id;
    return $.get(url).then(function(data) { 
      return {
        runner: data[0].runner,
        events: data
      };
    }, function(error) {
      console.log('freaaaking error! ');
      console.log(error);
    });
  }
  
});