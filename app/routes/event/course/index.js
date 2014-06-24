export default Ember.Route.extend({
  
  deserialize: function(params) {
    return this.modelFor('event.route');
  }
  
});
