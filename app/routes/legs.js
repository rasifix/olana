import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    return {
      legs: event.legs,
      categories: event.categories
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
