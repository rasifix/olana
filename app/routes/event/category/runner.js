export default Ember.Route.extend({
  
  deserialize: function(params) {
    var category = this.modelFor('event.category');
    var result = null;
    category.runners.forEach(function(runner) {
      if (parseInt(params['runner_id']) === runner.id) {
        result = runner;
      }
    });
    return result;
  },
  
  model: function() {
    return [];
  }
  
});
