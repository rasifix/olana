import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    event.courses.sort(function(c1, c2) {
      if (c1.id < c2.id) {
        return -1;
      } else if (c1.id > c2.id) {
        return 1;
      } else {
        return 0;
      }
    });
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
