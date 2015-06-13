import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  model: function() {
    return this.modelFor('event').getStartTime();
  },
  
  actions: {
    runnerClicked: function(runner) {
      this.transitionTo('category.runner', runner.category, runner.id);
    },
    runnerOver: function(runner) {
      this.get('controller').set('hoverRunner', runner);
    }
  }

});
