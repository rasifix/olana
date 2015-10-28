import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    return this.modelFor('event').getRunners().then(function(data) {
      return {
        runners: data
      };
    });
  }

});
