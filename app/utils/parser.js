import Runner from 'olana/models/runner';
import Split from 'olana/models/split';
import { parseTime, formatTime } from 'olana/utils/time';

function invalidTime(time) {
  return time === '-' || time === 's';
}

function sum(a1, a2) {
  return a1 + a2;
}

export function parseRanking(json) {
  var result = {
    name: json.name,
    distance: json.distance,
    ascent: json.ascent,
    controls: json.controls
  };

  // define the legs
  result.legs = json.runners[0].splits.map(function(split, idx, splits) {
    var from = idx === 0 ? 'St' : splits[idx - 1].code;
    return {
      code: from + '-' + split.code,
      runners: []
    };
  });
  
  result.runners = json.runners.map(function(runner) {
    return Runner.create({
      id: runner.id,
      fullName: runner.fullName,
      time: runner.time,
      yearOfBirth: runner.yearOfBirth,
      city: runner.city,
      club: runner.club,
      category: runner.category,
      splits: runner.splits.map(function(split, idx) {
        var splitTime = null;
        if (split.time === '-') {
          splitTime = '-';
        } else if (idx === 0) {
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
          yearOfBirth: runner.get('yearOfBirth'),
          club: runner.get('club'),
          city: runner.get('city'),
          category: runner.get('category'),
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
    
    // calculate the ideal time
    var selected = leg.runners.slice(0, Math.min(leg.runners.length, 5)).map(function(runner) { return parseTime(runner.split); });
    
    // only if there are valid splits for this leg
    if (selected.length > 0) {
      leg.idealSplit = Math.round(selected.reduce(sum) / selected.length);
    }
    
    // only if there are valid splits for this leg
    if (leg.runners.length > 0) {
      leg.fastestSplit = parseTime(leg.runners[0].split);
      leg.runners.slice(1).forEach(function(runner) {
        runner.splitBehind = '+' + formatTime(parseTime(runner.split) - leg.fastestSplit);
      });
      
      leg.runners[0].splitRank = 1;
      leg.runners.forEach(function(runner, idx, arr) {
        if (idx > 0) {
          if (runner.split === arr[idx - 1].split) {
            runner.splitRank = arr[idx - 1].splitRank;
          } else {
            runner.splitRank = idx + 1;
          }
        }
      });
    }
  });

  // calculate the ideal time [s]
  if (result.legs.length > 0) {
    result.idealTime = result.legs.map(function(leg) { return leg.idealSplit; }).reduce(sum);
    
    // visualization property - leg.position [0..1), leg.weight[0..1)
    result.legs.forEach(function(leg, idx) {
      leg.weight = leg.idealSplit / result.idealTime;
      if (idx === 0) {
        leg.position = leg.weight;
      } else {
        leg.position = result.legs[idx - 1].position + leg.weight;
      }
    });
  }
  
  // calculate how much time a runner lost on a leg
  result.runners.forEach(function(runner) {
    runner.splits.forEach(function(split, idx) {
      split.splitBehind = split.split === '-' || split.split === 's' ? '-' : formatTime(parseTime(split.split) - result.legs[idx].fastestSplit);
            
      // performance index for runner leg
      if (split.split !== '-' && split.split !== 's' && split.split !== '0:00') {
        split.perfidx = Math.round(1.0 * result.legs[idx].idealSplit / parseTime(split.split) * 100);
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
    var lastSplit = null;
    var lastRunner = null;
    runnerLegs.forEach(function(runnerLeg, pos) {
      var currentRunner = result.runners.find(function(runner) { return runner.id === runnerLeg.id; });
      if (lastSplit != null && parseTime(lastSplit) === parseTime(runnerLeg.split)) {
        currentRunner.splits[idx].splitRank = lastRunner.splits[idx].splitRank;
      } else {
        currentRunner.splits[idx].splitRank = pos + 1;
      }
      lastSplit = runnerLeg.split;
      lastRunner = currentRunner;
    });
    
    // resort by run time
    runnerLegs.sort(function(l1, l2) {
      return parseTime(l1.time) - parseTime(l2.time);
    });
    
    // assign overall rank
    var pos = 1;
    var lastTime = null;
    
    runnerLegs.forEach(function(runnerLeg) {
      var currentRunner = result.runners.find(function(runner) { return runner.id === runnerLeg.id; });
      if (lastTime == null || parseTime(lastTime) === parseTime(runnerLeg.time)) {
        currentRunner.splits[idx].overallRank = pos;
      } else {
        currentRunner.splits[idx].overallRank = ++pos;
      }
      lastTime = runnerLeg.time;
    });
  });
  
  result.legs.forEach(function(leg, idx) {
    if (idx === 0) {
      leg.fastestTime = formatTime(leg.fastestSplit);
      leg.idealTime = formatTime(leg.idealSplit);
    } else {
      leg.fastestTime = formatTime(parseTime(result.legs[idx - 1].fastestTime) + leg.fastestSplit);
      leg.idealTime = formatTime(parseTime(result.legs[idx - 1].idealTime) + leg.idealSplit);
    }
  });
  
  result.runners.forEach(function(runner) {
    // calculate overall time behind leader
    runner.splits.forEach(function(split, splitIdx) {
      if (!invalidTime(split.time)) {
        var leader = result.runners.map(function(r) {
          return {
            time: r.splits[splitIdx].time,
            rank: r.splits[splitIdx].overallRank
          };
        }).find(function(split) {
          return split.rank === 1;
        });
        
        // no leader for this leg?!
        if (leader) {
          var leaderTime = leader.time;
          if (parseTime(split.time) !== null) {
            split.overallBehind = formatTime(parseTime(split.time) - parseTime(leaderTime));
            split.fastestBehind = formatTime(parseTime(split.time) - parseTime(result.legs[splitIdx].fastestTime));
            split.idealBehind = formatTime(parseTime(split.time) - parseTime(result.legs[splitIdx].idealTime));
          } else {
            split.overallBehind = '-';
            split.fastestBehind = '-';
            split.idealBehind = '-';
          }
        }
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

