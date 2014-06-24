import { parseTime, formatTime } from 'appkit/utils/time';

var findCategory = function(categories, runnerId) {
  var result = null;
  categories.forEach(function(cat) {
    cat.runners.forEach(function(runner) {
      if (runner.id === runnerId) {
        result = cat;
        return;
      }
    });
  });
  return result;
};

var findRunner = function(category, runnerId) {
  var result = null;
  category.runners.forEach(function(runner) {
    if (runner.id === runnerId) {
      result = runner;
      return;
    }
  });
  return result;
};

export default Ember.Route.extend({
  
  deserialize: function(params) {    
    var runnerId = parseInt(params["runner_id"]);
    var event = this.modelFor('event');
    
    var category = findCategory(event.categories, runnerId);
    var runner = findRunner(category, runnerId);
    
    // select box values (all except the current runner)
    var opponents = category.runners.map(function(r) { return r; }).removeObject(runner);
    var opponent = opponents[0];
    
    var diffs = { };
    runner.splits.forEach(function(split, idx) {
      opponents.forEach(function(opponent) {
        var opponentSplit = opponent.splits[idx];
        var diff = parseTime(split.split) - parseTime(opponentSplit.split);
        if (!diffs[opponent.id]) {
          diffs[opponent.id] = [];
        }
        diffs[opponent.id].push({ diff: diff, code: split.code, number: split.number });
      });
    });
        
    return {
      runner: runner,
      opponent: opponent,
      selectedOpponent: opponent.id,
      opponents: opponents,
      diffs: diffs
    };
  },
  
  model: function(params) {
    var model = this.modelFor('event');
    return model;
  }

});
