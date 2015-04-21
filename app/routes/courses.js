import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    return {
      courses: event.courses
    };
  },
  
  actions: {
    courseClicked: function(name) {
      this.transitionTo('course', name);
    }
  }

});
