import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    return this.modelFor('event').getCourses().then(function(data) {
      return {
        courses: data
      }
    });
  },
  
  actions: {
    courseClicked: function(name) {
      this.transitionTo('course', name);
    }
  }

});
