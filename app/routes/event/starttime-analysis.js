import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  parseData: function(event) {
    var result = { categories: [ ] };

    event.categories.forEach(function(category) {
      var cat = { name: category.name, runners: [] };
      result.categories.push(cat);

      var last = null;
      var pos = 1;
      var filtered = category.runners.filter(function(runner) { return parseTime(runner.time) !== null; });
      filtered.forEach(function(runner, idx) {
        if (last != null) {
          if (parseTime(runner.time) > last) {
            pos = idx + 1;
          }
        }
        var point = {
          id: runner.id,
          startTime: runner.startTime,
          time: runner.time,
          rank: pos,
          fullName: runner.fullName,
          sex: runner.sex,
          category: category.name
        };
        cat.runners.push(point);
        last = parseTime(runner.time);
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
