import Route from '@ember/routing/route';

export default Route.extend({
  
  model: function() {
    return this.modelFor('event').getCourses().then(function(data) {
      return {
        courses: data
      };
    });
  },
  
  actions: {
    courseClicked: function(name) {
      this.transitionTo('event.courses.course', name);
    }
  }

});
