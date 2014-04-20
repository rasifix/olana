import { parseTime, formatTime } from 'appkit/utils/time';

export default Ember.Route.extend({
  
  deserialize: function(params) {
    var legId = params["leg_id"];
    var parts = legId.split("-");
    var from = parts[0];
    var to = parts[1];
    
    var event = this.modelFor('event');
        
    var result = [];
    event.categories.filter(function(cat) { return !cat.virtual; }).forEach(function(cat) {
      var makeEntry = function(runner) {
        return { 
          category: cat.name,
          runner: runner.get('fullName'),
          club: runner.club,
          yearOfBirth: runner.yearOfBirth,
          runnerId: runner.id,
          split: runner.splits[idx].splitTime,
          timeLoss: runner.splits[idx].timeLoss
        };
      };
      for (var idx = 0; idx < cat.legs.length; idx++) {
        var leg = cat.legs[idx];
        if (to === leg.code) {
          if ((idx === 0 && from === "St") || (idx > 0 && from === cat.legs[idx - 1].code)) {
            var mapped = cat.runners.map(makeEntry);
            result = result.concat(mapped);
          }
        }
      }
    });
    
    result.sort(function(r1, r2) {
      return parseTime(r1.split) - parseTime(r2.split);
    });
    
    var last = null;
    result.map(function(runner, idx, runners) {
      if (idx === 0) {
        runner.pos = 1;
        runner.displayPos = "1.";
      } else if (parseTime(runner.split) - parseTime(last) === 0) {
        runner.pos = runners[idx - 1].pos;
        runner.displayPos = "";
      } else {
        runner.pos = idx + 1;
        runner.displayPos = runner.pos + ".";
      }
      if (idx !== 0) {
        runner.behind = '+' + formatTime(parseTime(runner.split) - parseTime(runners[0].split));
      }
      last = runner.split;
      return runner;
    });
    
    return {
      from: from,
      to: to,
      name: from + '-' + to,
      data: result
    };
  },
  
  model: function() {
    // totally irrelevant...
    return [];
  }

});
