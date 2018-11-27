import Controller from '@ember/controller';
import { parseTime, formatTime } from 'olana/utils/time';
import { computed } from '@ember/object';

function isValid(value) {
  return value !== '-' && value !== 's' && parseTime(value) !== null;
}

function sum(a, b) {
  return a + b;
}

function defineLegs(category, runners) {
  // helper function to create ranking entry for runner
  var createRankingEntry = function(runner, category, splitTime) {
    return {
      id: runner.id,
      fullName: runner.fullName,
      yearOfBirth: runner.yearOfBirth,
      city: runner.city,
      club: runner.club,
      split: formatTime(splitTime),
      category: category
    };
  };
  
  var legs = { };
  runners.forEach(function(runner) {
    var lastTime = null;
    var lastControl = 'St';
    runner.splits.forEach(function(split) {
      var control = split.code;
      var time = split.time;
      var code = lastControl + '-' + control;
      if (!legs[code]) {
        legs[code] = {
          id: code,
          from: lastControl,
          to: control,
          categories: { },
          runners: []
        };
      }
      if (isValid(time) && (lastTime == null || isValid(lastTime))) {
        var splitTime = lastTime !== null ? parseTime(time) - parseTime(lastTime) : parseTime(time);
        legs[code].runners.push(createRankingEntry(runner, category, splitTime));
      }
      
      lastControl = control;
      lastTime = time;
    });
  });
  
  // convert legs hash into array
  var result = [];
  Object.keys(legs).forEach(function(code) {
    var leg = legs[code];
    leg.runners.sort(function(s1, s2) {
      return parseTime(s1.split) - parseTime(s2.split);
    });
    
    // calculate the ideal time
    var selected = leg.runners.slice(0, Math.min(leg.runners.length, 5)).map(function(runner) { return parseTime(runner.split); });
    
    // only if there are valid splits for this leg
    if (selected.length > 0) {
      leg.idealSplit = Math.round(selected.reduce(sum) / selected.length);
    }
        
    result.push(leg);
  });

  result.forEach(function(leg) {
    var timeLosses = 0;
    
    // TODO: avoid defining legs without runners?!
    var fastest = leg.runners.length > 0 ? parseTime(leg.runners[0].split) : 0;
    
    leg.runners.forEach(function(runner, idx) {
      var r = runners.find(candidate => candidate.id === runner.id);
      var s = r.splits.find(split => leg.id === split.leg);
      if (s && s.timeLoss) {
        timeLosses += 1;
        runner.timeLoss = s.timeLoss;
      }
      
      if (idx > 0) {
        runner.splitBehind = '+' + formatTime(parseTime(runner.split) - fastest);
      }
      
      if (idx === 0) {
        runner.splitRank = 1;
      } else {
        var prev = leg.runners[idx - 1];
        if (prev.split === runner.split) {
          runner.splitRank = prev.splitRank;
        } else {
          runner.splitRank = idx + 1;
        }
      }
    });
    
    if (leg.runners.length > 0) {
      leg.errorFrequency = Math.round(100 * timeLosses / leg.runners.length);
    }
  });
  
  if (result.length > 0) {
    var idealTime = result.map(function(leg) { return leg.idealSplit; }).reduce(sum);
    
    // visualization property - leg.position [0..1), leg.weight[0..1)
    result.forEach(function(leg, idx) {
      leg.weight = leg.idealSplit / idealTime;
      if (idx === 0) {
        leg.position = leg.weight;
      } else {
        leg.position = result[idx - 1].position + leg.weight;
      }
    });
  }
    
  return result;
}

export default Controller.extend({
 
  init: function() {
    this._super(...arguments);
    var self = this;
    window.onresize = function() {
      self.refreshGraphWidth();
    };
    this.refreshGraphWidth();
  },
  
  refreshGraphWidth: function() {
    if (window.screen.availWidth >= 1200) {
      this.set('graphWidth', 1140);
    } else if (window.screen.availWidth >= 992) {
      this.set('graphWidth', 940);
    } else if (window.screen.availWidth >= 768) {
      this.set('graphWidth', 720);
    } else {
      this.set('graphWidth', window.screen.availWidth - 2 * 15);
    }
  },
    
  checkedRunners: computed('model.runners.@each.checked', function() {
    return this.get('model.runners').filter(function(d) { return d.checked; })
  }),
  
  legs: computed('model.runners', function() {
    defineLegs(this.get('model.name'), this.get('model.runners'))
  })
  
});