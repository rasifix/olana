import Runner from 'appkit/models/runner';
import Split from 'appkit/models/split';
import { parseTime, formatTime } from 'appkit/utils/time';

/*
 calculates the legs of the competition
 - code: control code
 - index: zero-based index of the leg
 - fastest: fastest split time
 - runner: runner achieving the fastest time
 - weight: weight of the leg calculated by dividing fastest time / superman time
 - position: position of the control [0..1], equal to the sum of all weights up to this control
 */
function calculateLegs(category) {
  var runners = category.runners;
  
  var legs = runners[0].splits.map(function(leg, idx) {
    return { code: leg.code, number: idx + 1 };
  });
  
  legs.forEach(function(leg, idx) {
    if (idx === 0) {
      leg.leg = 'St-' + leg.code;
    } else {
      leg.leg = legs[idx - 1].code + '-' + leg.code;
    }
  });
  
  runners.forEach(function(runner) {
    runner.splits.forEach(function(split, idx) {
      var current = legs[idx];   
      split.index = idx;   
      if (split.split !== null) {
        var splitTime = split.split !== '0:00' ? parseTime(split.split) : '99:99';
        if (typeof current.fastest === 'undefined') {
          current.fastest = split.split;
          current.runner = runner;
        } else if (splitTime < parseTime(current.fastest)) {
          current.fastest = split.split;
          current.runner = runner;
        }
      }
    });
  });

  var superman = legs.reduce(function(prev, curr, idx) {
    return prev + parseTime(curr.fastest);
  }, 0);

  var lastPosition = 0;
  legs.forEach(function(leg) {
    leg.weight = parseTime(leg.fastest) / superman;
    leg.position = lastPosition + leg.weight;
    lastPosition = leg.position;
  });
  
  runners.forEach(function(runner) {
    var behind = 0;
    
    var weightedLoss = [];
    
    runner.splits.forEach(function(leg, idx) {
      var split = parseTime(leg.split);
      behind += split - parseTime(legs[idx].fastest);
      leg.behind = formatTime(behind);
      leg.splitBehind = '+' + formatTime(split - parseTime(legs[idx].fastest));
      
      weightedLoss.push({
        loss: (split - parseTime(legs[idx].fastest)) / legs[idx].weight,
        legIdx: idx
      });
      
      var current = legs[idx];
      if (idx === 0) {
        leg.position = current.weight;
      } else {
        leg.position = legs[idx - 1].position + current.weight;
        if (isNaN(leg.position)) throw "FAILURE AT IDX " + idx;
      }
    });
    
    weightedLoss.sort(function(l1, l2) {
      return l1.loss - l2.loss;
    });
    
    if (weightedLoss[Math.round(weightedLoss.length / 2)]) {
      var medianWeightedLoss = weightedLoss[Math.round(weightedLoss.length / 2)].loss;
      runner.splits.forEach(function(split, idx) {
        var splitBehind = parseTime(split.splitBehind.substr(1));
        var weightedLoss = splitBehind / legs[idx].weight;
        if (weightedLoss / medianWeightedLoss > 1.2) {
          split.timeLoss = '+' + formatTime(splitBehind - Math.round(medianWeightedLoss * legs[idx].weight));
          split.hasError = true;
        }
      });
    }
  });

  // extract the runner leg at index idx for each runner
  var extractLegs = function(idx) {
    var result = [];
    runners.forEach(function(runner) {
      result.push(runner.splits[idx]);
    });
    return result;
  };

  legs.forEach(function(leg, idx) {
    var runnerLegs = extractLegs(idx);
    runnerLegs.sort(function(l1, l2) {
      return parseTime(l1.split) - parseTime(l2.split);
    });
    var pos = 1;
    var lastSplit = null;
    runnerLegs.forEach(function(runnerLeg, i) {
      if (lastSplit == null || parseTime(lastSplit) === parseTime(runnerLeg.split)) {
        runnerLeg.splitRank = pos;
      } else {
        runnerLeg.splitRank = ++pos;
      }
      lastSplit = runnerLeg.split;
    });

    runnerLegs.sort(function(l1, l2) {
      return parseTime(l1.time) - parseTime(l2.time);
    });
    pos = 1;
    var lastTime = null;
    runnerLegs.forEach(function(runnerLeg) {
      if (lastTime == null || parseTime(lastTime) === parseTime(runnerLeg.time)) {
        runnerLeg.overallRank = pos;
      } else {
        runnerLeg.overallRank = ++pos;
      }
      lastTime = runnerLeg.time;
    });
  });
  
  legs.forEach(function(leg, idx) {
    var runnerSplits = extractLegs(idx);
    var leader = runnerSplits.find(function(runnerSplit) {
      return runnerSplit.overallRank === 1;
    });
    runnerSplits.forEach(function(runnerSplit) {
      runnerSplit.overallBehind = '+' + formatTime(parseTime(runnerSplit.time) - parseTime(leader.time));
    });
  });
  
  return legs;
}

function parseData(json) {
  var result = json;
  
  result.legs = result.runners[0].splits.map(function(split, idx) {
    return {
      code: split.code,
      fastest: split.time
    };
  });
  
  result.runners = result.runners.map(function(runner, idx) {
    return Runner.create({
      id: '' + idx,
      firstName: runner.firstName,
      name: runner.name,
      runTime: runner.runTime,
      yearOfBirth: runner.yearOfBirth,
      city: runner.city,
      club: runner.club,
      splits: runner.splits.map(function(split, idx) {
        return Split.create({
          number: idx + 1,
          code: split.code,
          time: split.time,
          split: idx === 0 ? split.time : formatTime(parseTime(split.time) - parseTime(runner.splits[idx - 1].time))
        });
      })
    });
  });

  // calculate the fastest time on each leg
  result.runners.forEach(function(runner) {
    runner.splits.forEach(function(split, idx) {
      var leg = result.legs[idx];
      if (parseTime(split.split) < parseTime(leg.fastest)) {
        leg.fastest = split.split;
      }
    });
  });
  
  // calculate the superman time [s]
  result.superman = result.legs.reduce(function(prev, current) {
    return prev + parseTime(current.fastest);
  }, 0);
  
  // visualization property - leg.position [0..1), leg.weight[0..1)
  result.legs.forEach(function(leg, idx) {
    leg.weight = parseTime(leg.fastest) / result.superman;
    if (idx === 0) {
      leg.position = leg.weight;
    } else {
      leg.position = result.legs[idx - 1].position + leg.weight;
    }
  });
  
  // calculate how much time a runner lost on a leg
  result.runners.forEach(function(runner) {
    runner.splits.forEach(function(split, idx) {
      split.splitBehind = formatTime(parseTime(split.split) - parseTime(result.legs[idx].fastest));
      split.behind = idx === 0 ? split.splitBehind : formatTime(parseTime(runner.splits[idx - 1].behind) + parseTime(split.splitBehind));
      // visualization property - split.position [0..1)
      split.position = result.legs[idx].position;
    });
  });
  
  // calculate the rank
  result.runners.forEach(function(runner, idx) {
    if (idx === 0) {
      runner.set('rank', 1);
    } else {
      var prev = result.runners[idx - 1];
      if (prev.runTime === runner.runTime) {
        runner.set('rank', prev.rank);
      } else {
        runner.set('rank', idx + 1);
      }
    }
  });
  return result;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function assignRank(runners) {
  var last = null;
  runners.map(function(runner, idx, runners) {
    if (idx === 0) {
      runner.rank = 1;
    } else if (parseTime(runner.runTime) - parseTime(last) === 0) {
      runner.rank = runners[idx - 1].rank;
    } else {
      runner.rank = idx + 1;
    }
    last = runner.runTime;
    return runner;
  });
}

function calculateCategory(cat) {
  cat.runners.sort(function(r1, r2) { return parseTime(r1.runTime) - parseTime(r2.runTime); });
  assignRank(cat.runners);
}

export default Ember.Route.extend({
  
  deserialize: function(params) {
    var eventId = this.modelFor('event').id;
    var id = params['category_id'];
    var url = 'http://localhost:5984/olana/_design/olana-couch/_view/category-details?key=' + encodeURIComponent(JSON.stringify([eventId, id]));
    return $.get(url).then(function(data) { 
      var json = JSON.parse(data);
      return parseData(json.rows[0].value);
    });
  },
  
  actions: {
    onlegclick: function(leg) {
      this.transitionTo('event.leg', leg.leg);
    }
  },
  
  model: function(params) {
    // totally irrelevant...
    return [];
  }

});
