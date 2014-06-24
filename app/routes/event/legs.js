export default Ember.Route.extend({
  
  deserialize: function(params) {
    var event = this.modelFor('event');
    event.legs.sort(function(l1, l2) {
      if (l1.id < l2.id) {
        return -1;
      } else if (l1.id === l2.id) {
        return 0;
      } else {
        return 1;
      }
    });
    console.log(event.legs);
    return {
      legs: event.legs,
      name: 'Strecken'
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('event.leg', name);
    }
  },
  
  model: function(params) {
    // totally irrelevant...
    return [];
  }

});
