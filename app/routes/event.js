import Runner from 'appkit/models/runner';
import Split from 'appkit/models/split';
import { parseTime, formatTime } from 'appkit/utils/time';
       
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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
  category.legs = legs;
  
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
        runnerLeg.splitRank = pos
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
}

function parseData(data) {
  var parseCategory = function(row) {
    return {
      name: row[0],
      distance: parseInt(row[1]),
      ascent: parseInt(row[2]),
      controls: parseInt(row[3]),
      runners: []
    };
  };
  
  var rawrows = data.split("\n");

  var rows = rawrows.map(function(row) {
    return row.split(";");
  });
  var header = rows.splice(0, 1)[0];
    
  // prepare the column headers
  header[0] = header[0].substring(10);
  header.length = 15;
    
  // delete the event header for now
  var eventName = rows[0][0].substring(2);
  var date = rows[0][2];

  var idx = 1;
  var category = parseCategory(rows[idx++]);
  var categories = [ category ];
    
  for ( ; idx < rows.length; idx++) {
    var row = rows[idx];
    
    // skip empty rows
    if (!row) { continue; }
    
    var totalTime = parseTime(row[12]); // <-- hardcoded
    if (row[0].length > 0 && !isNumber(row[0])) {
      calculateLegs(category);
      category = parseCategory(row);
      categories.pushObject(category);
    } else {
      var splits = [ ];
      for (var i = header.length; i < row.length; i+= 2) {
        var index = (i - header.length) / 2;
        var split = { code: row[i], time: row[i + 1], number: index + 1 };
        if (i === header.length) {
          split.split = split.time;
        } else {
          split.split = formatTime(parseTime(split.time) - parseTime(row[i - 1]));
        }
        split.splitTime = split.split;
        split.leg = index === 0 ? 'St-' + split.code : splits[splits.length - 1].code + '-' + split.code;
        splits.pushObject(split);
      }
      if (totalTime !== -1) {
        var split = { code: 'Zi', time: formatTime(totalTime) };
        split.split = formatTime(totalTime - parseTime(row[row.length - 1]));
        split.splitTime = split.split;
        split.number = splits.length + 1;
        split.splitBehind = null;
        split.splitRank = null;
        split.leg = splits[splits.length - 1].code + '-Zi';
        splits.pushObject(split);
      }
      var runTime = row[12];
      if (parseTime(runTime) != -1) {
        var rank = row[0];
        var runner = Runner.create({
          id: idx,
          checked: rank < 6, // hardcoded -> make configurable
          rank: rank,
          name: row[1],
          firstName: row[2],
          yearOfBirth: row[3],
          town: row[7],
          club: row[8],
          runTime: runTime,          
          splits: splits
        });
        category.runners.pushObject(runner);
      }
    }
  }
  
  // last category
  calculateLegs(category);
  
  // calculate legs of event
  var legset = { };
  categories.forEach(function(category) {
    category.legs.forEach(function(leg, idx) {
      var legcode;
      if (idx === 0) {
        legcode = 'St-' + leg.code;
      } else if (idx === category.legs.length - 1) {
        legcode = category.legs[idx - 1].code + '-Zi';
      } else {
        legcode = category.legs[idx - 1].code + '-' + leg.code;
      }
      if (!legset[legcode]) {
        legset[legcode] = [];
      }
      legset[legcode].push(category.name);
    });
  });
  
  var legs = [];
  for (var key in legset) {
    legs.push({ code: key, categories: legset[key].join(',') });
  }
  
  legs.sort(function(l1, l2) {
    if (l1.code.substr(0, 2) === 'St' && l2.code.substr(0, 2) === 'St') {
      return l1.code.localeCompare(l2.code);
    } else if (l1.code.substr(0, 2) === 'St') {
      return -1;
    } else if (l2.code.substr(0, 2) === 'St') {
      return 1;
    }
    return l1.code.localeCompare(l2.code);
  });
  
  return {
    'name': eventName,
    'date': date,
    'categories': categories,
    'legs': legs
  };
}

export default Ember.Route.extend({
  
  model: function(params) {
    var id = params['event_id'];
    var url = 'event/' + id + '.csv';
    return $.get(url).then(function(data) {
      var d = parseData(data);
      d.id = id;
      return d;
    });
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('event.category', name);
    },
    legClicked: function(name) {
      this.transitionTo('event.leg', name);
    }
  }

});
