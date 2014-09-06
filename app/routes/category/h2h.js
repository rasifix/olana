import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

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
  
  model: function(params) {
    var runnerId = params["runner_id"];
    var category = this.modelFor('category');
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
  }

});
