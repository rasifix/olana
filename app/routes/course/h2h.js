import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  model: function(params) {
    var id = parseInt(params['runner_id'], 10);
    var course = this.modelFor('course');
    var runner = course.runners.find(function(runner) { return runner.id === id; });
    
    if (!runner) {
      this.transitionTo('category');
      return;
    }
    
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
