import Route from '@ember/routing/route';

export default Route.extend({
  
  model: function() {
    return this.modelFor('event').getRunners().then(function(data) {
      return {
        runners: data
      };
    });
  }

});
