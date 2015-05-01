import Ember from 'ember';
import { parseRanking } from 'olana/utils/parser';
import log from 'olana/utils/log';

export default Ember.Route.extend({
    
  model: function(params) {
    var event = this.modelFor('event');
    var id = params['course_id'];
    var course = event.courses.find(function(course) {
      if (course.id === id) {
        return course;
      }
    });
    if (!course) {
      this.transitionTo('courses');
      return;
    }
    return parseRanking(course);
  },
  
  actions: {
    onlegclick: function(leg) {
      log(leg);
      //this.transitionTo('leg', leg.leg);
    }
  }
  
});