export default Ember.Route.extend({
  
  deserialize: function(params) {
    var event = this.modelFor('event');
    return {
      legs: event.legs,
      name: 'Strecken'
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('event.legs.leg', name);
    }
  },
  
  model: function(params) {
    // totally irrelevant...
    return [];
  }

});
