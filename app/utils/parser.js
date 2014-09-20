import Runner from 'olana/models/runner';
import Split from 'olana/models/split';
import { parseTime, formatTime } from 'olana/utils/time';

function invalidTime(time) {
  return time === '-' || time === 's';
}

export function parseRanking(json) {
  // transform data structure from wire-optimal to code-optimal
  json.runners.forEach(function(runner) {
    runner.splits = runner.splits.map(function(split) {
      return {
        code: split[0],
        time: split[1]
      };
    });
    
    // add split time to finish
    runner.splits.push({
      code: 'Zi',
      time: runner.time
    });
  });
  
  var result = json;

  result.legs = result.runners[0].splits.map(function(split) {
    return {
      code: split.code,
      runners: []
    };
  });
      
  result.runners = result.runners.map(function(runner, idx) {
    return Runner.create({
      id: runner.ecard,
      firstName: runner.firstName,
      name: runner.name,
      time: runner.time,
      yearOfBirth: runner.yearOfBirth,
      city: runner.city,
      club: runner.club,
      category: runner.category,
      splits: runner.splits.map(function(split, idx) {
        var splitTime = null;
        if (idx === 0) {
          splitTime = formatTime(parseTime(split.time));
        } else {
          if (parseTime(split.time) === null || parseTime(runner.splits[idx - 1].time) === null) {
            splitTime = '-';
          } else {
            splitTime = formatTime(parseTime(split.time) - parseTime(runner.splits[idx - 1].time));
          }
        }

        return Split.create({
          number: idx + 1,
          code: split.code,
          time: split.time,
          split: splitTime
        });
      })
    });
  });
  
  // add the runners
  result.runners.forEach(function(runner) {
    runner.splits.forEach(function(split, idx) {
      if (split.split !== '-') {
        result.legs[idx].runners.push({
          id: runner.id,
          fullName: runner.get('fullName'),
          split: split.split
        });
      }
    });
  });
  
  // sort the runners per leg
  result.legs.forEach(function(leg) {
    leg.runners.sort(function(r1, r2) {
      return parseTime(r1.split) - parseTime(r2.split);
    });
    
    var top25 = leg.runners.slice(0, Math.max(leg.runners.length * 0.25, 1));
    leg.hundertpct = Math.round(top25.reduce(function(prev, curr) { return prev + parseTime(curr.split); }, 0) / top25.length);
    leg.fastest = leg.runners[0].split;
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
      split.splitBehind = split.split === '-' ? '-' : formatTime(parseTime(split.split) - parseTime(result.legs[idx].fastest));
      
      // performance index for runner leg
      if (split.split !== '-') {
        split.perfidx = Math.round(1.0 * result.legs[idx].hundertpct / parseTime(split.split) * 100);
      }
      
      // leg id
      split.leg = (idx > 0 ? runner.splits[idx - 1].code : 'St') + '-' + runner.splits[idx].code;
      
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
      if (prev.time === runner.time) {
        runner.set('rank', prev.rank);
      } else if (parseTime(runner.time)) {
        runner.set('rank', idx + 1);
      }
    }
  });
  
  // extract the runner leg at index idx for each runner
  var extractLegs = function(idx) {
    var arr = [];
    result.runners.forEach(function(runner) {
      var split = runner.splits[idx];
      if (split.split !== '-') {
        arr.push({
          id: runner.id,
          split: split.split,
          time: split.time,
          code: split.code
        });
      }
    });
    return arr;
  };
  
  result.legs.forEach(function(leg, idx) {
    // get all the splits for the current leg
    var runnerLegs = extractLegs(idx);
    
    // sort by split time
    runnerLegs.sort(function(l1, l2) {
      return parseTime(l1.split) - parseTime(l2.split);
    });
    
    // assign split rank
    var pos = 1;
    var lastSplit = null;
    runnerLegs.forEach(function(runnerLeg) {
      var currentRunner = result.runners.find(function(runner) { return runner.id === runnerLeg.id; });;
      if (lastSplit == null || parseTime(lastSplit) === parseTime(runnerLeg.split)) {
        currentRunner.splits[idx].splitRank = pos;
      } else {
        currentRunner.splits[idx].splitRank = ++pos;
      }
      lastSplit = runnerLeg.split;
    });
    
    // resort by run time
    runnerLegs.sort(function(l1, l2) {
      return parseTime(l1.time) - parseTime(l2.time);
    });
    
    // assign overall rank
    pos = 1;
    var lastTime = null;
    var leaderTime;
    runnerLegs.forEach(function(runnerLeg) {
      var currentRunner = result.runners.find(function(runner) { return runner.id === runnerLeg.id; });
      if (lastTime == null || parseTime(lastTime) === parseTime(runnerLeg.time)) {
        if (pos === 1) {
          leaderTime = runnerLeg.time;
        }
        currentRunner.splits[idx].overallRank = pos;
      } else {
        currentRunner.splits[idx].overallRank = ++pos;
      }
      lastTime = runnerLeg.time;
    });
  });
  
  result.legs.forEach(function(leg, idx) {
    if (idx === 0) {
      leg.superman = leg.fastest;
    } else {
      leg.superman = formatTime(parseTime(result.legs[idx - 1].superman) + parseTime(leg.fastest));
    }
  });
  
  result.runners.forEach(function(runner) {
    // calculate overall time behind leader
    runner.splits.forEach(function(split, splitIdx) {
      if (!invalidTime(split.time)) {
        var leaderTime = result.runners.map(function(runner) {
          return {
            time: runner.splits[splitIdx].time,
            rank: runner.splits[splitIdx].overallRank
          };
        }).find(function(split) {
          return split.rank === 1;
        }).time;
        split.overallBehind = formatTime(parseTime(split.time) - parseTime(leaderTime));
        split.supermanBehind = formatTime(parseTime(split.time) - parseTime(result.legs[splitIdx].superman));
      }
    });
    
    var perfindices = runner.splits.map(function(split) { return split.perfidx; }).sort(function(s1, s2) { return s1 - s2; });
    var middle = null;
    if (perfindices.length % 2 === 1) {
      middle = perfindices[Math.floor(perfindices.length / 2)];
    } else {
      middle = (perfindices[perfindices.length / 2] + perfindices[perfindices.length / 2 + 1]) / 2;
    }
    
    runner.errorTime = 0;
    runner.splits.forEach(function(split) {
      var errorFreeTime = Math.round(parseTime(split.split) * (split.perfidx / middle));
      var errorThresholdPct = 1.2;
      var errorThreshold = 10;
      if (parseTime(split.split) / errorFreeTime > errorThresholdPct && (parseTime(split.split) - errorFreeTime) > errorThreshold) {        
        split.timeLoss = formatTime(parseTime(split.split) - errorFreeTime);
        runner.errorTime += parseTime(split.timeLoss);
      }
    });
    runner.errorTime = formatTime(runner.errorTime);
  });
  
  return result;
}


/*
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
*/

/*
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
*/