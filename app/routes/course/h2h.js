import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

var findRunner = function(course, runnerId) {
  var result = null;
  course.runners.forEach(function(runner) {
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
    var course = this.modelFor('course');
    var runner = findRunner(course, runnerId);
    
    // select box values (all except the current runner)
    var opponents = course.runners.map(function(r) { return r; }).removeObject(runner);
    var opponent = opponents[0];
    
    var diffs = { };
    runner.splits.forEach(function(split, idx) {
      opponents.forEach(function(opponent) {
        var opponentSplit = opponent.splits[idx];
        if (!diffs[opponent.id]) {
          diffs[opponent.id] = [];
        }
        var diff = parseTime(split.split) - parseTime(opponentSplit.split);
        if (split.split === '-' || opponentSplit.split === '-') {
          diff = 0;
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
