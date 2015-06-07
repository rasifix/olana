import Ember from 'ember';
import { parseTime } from 'olana/utils/time';
import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
  
  parseData: function(event) {
    var result = {
      categories: event.categories.map(function(category) { return category.name; }),
      timeLosses: [ ]
    };
    
    event.categories.forEach(function(category) {
      var filtered = parseRanking(category).runners.filter(function(runner) { return parseTime(runner.time) !== null; });
      
      filtered.forEach(function(runner) {
        runner.splits.filter(function(split) { return split.timeLoss; }).forEach(function(split) {
          var timeLoss = parseTime(split.timeLoss);
          result.timeLosses.push({
            category: category.name,
            timeLoss: timeLoss,
            position: split.position
          });
        });
      });
    });
    
    return result;
  }, 
  
  model: function() {
    var event = this.modelFor('event');
    return this.parseData(event);
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
