import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    return {
      legs: event.legs
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
