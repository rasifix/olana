export default Ember.Route.extend({
  
  model: function() {
    var model = this.modelFor('event');
    return model;
  }

});
