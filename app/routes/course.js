import Ember from 'ember';
import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
    
  model: function(params) {
    var event = this.modelFor('event');
    var id = params['course_id'];
    var course = event.courses.find(function(course) {
      if (course.id === id) {
        return course;
      }
    });
    return parseRanking(course);
  },
  
  actions: {
    onlegclick: function(leg) {
      this.transitionTo('leg', leg.leg);
    }
  }
  
});