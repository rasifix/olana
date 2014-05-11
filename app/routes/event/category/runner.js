import { parseTime, formatTime } from 'appkit/utils/time';

function groupBy(array, f) {
  var groups = { };
  array.forEach(function(o) {
    var group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);  
  });
  return Object.keys(groups).map(function(group) {
    return groups[group]; 
  });
}

export default Ember.Route.extend({
  
  deserialize: function(params) {
    var category = this.modelFor('event.category');
    var result = null;
    category.runners.forEach(function(runner) {
      if (parseInt(params['runner_id']) === runner.id) {
        result = runner;
      }
    });
    
    if (!result.histogram) {
      var groupFct = function(split) { return Math.floor((split.perfidx + 2) / 4); };
      result.histogram = groupBy(result.splits, groupFct).map(function(splits) {
        return splits.reduce(function(prev, curr, idx) {
          if (!prev) {
            return { key: groupFct(curr) * 4, value: parseTime(curr.split) };
          } else {
            prev.value += parseTime(curr.split);
            return prev;
          }
        }, null);
      });
    }
    
    return result;
  },
  
  model: function() {
    return [];
  }
  
});
