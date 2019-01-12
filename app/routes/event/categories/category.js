import Route from '@ember/routing/route';

import { parseTime } from 'olana/utils/time';

export default Route.extend({
  
  model: function(params) {
    var self = this;
    var event = this.modelFor('event');
    var id = params['category_id'];
    var category = event.getCategory(id);
    category.fail(function() {
      self.transitionTo('event.categories');
    }).then(function(category) {
      category.runners.forEach(function(runner) {
        runner.valid = parseTime(runner.time) !== null;
      });
    });
        
    return category;
  },
  
  actions: {
    onlegclick: function(leg) {
      // FIXME: leg.leg is undefined (only leg.code exists which is a control)
      this.transitionTo('event.legs.leg', leg.leg);
    },
    runnerClicked: function(runner) {
      runner.set('showSplits', !runner.get('showSplits'));
    }
  }

});