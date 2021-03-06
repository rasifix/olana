import Route from '@ember/routing/route';
import log from 'olana/utils/log';

export default Route.extend({
    
  model: function(params) {
    var event = this.modelFor('event');
    var id = params['course_id'];
    var course = event.getCourse(id);
    if (!course) {
      this.transitionTo('event.courses');
      return;
    }
    return course;
  },
  
  actions: {
    onlegclick: function(leg) {
      log(leg);
      //this.transitionTo('leg', leg.leg);
    },
    runnerClicked: function(runner) {
      runner.set('showSplits', !runner.get('showSplits'));
    }
  }
  
});