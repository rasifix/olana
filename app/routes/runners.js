import Runner from 'appkit/models/runner';
import Split from 'appkit/models/split';

var parseTime = function(str) {
  var split = str.split(":");
  return parseInt(split[0]) * 60 + parseInt(split[1]);
};

var pad = function(str) {
  return str.length === 1 ? "0" + str : str;
};

var formatTime = function(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
};

export default Ember.Route.extend({
  
  model: function() {
    return $.getJSON("/data.json").then(function(d) {
      d.runners.forEach(function(runner, idx) {
        runner.checked = idx < 10;
      });
      var runners = d.runners.map(function(e, idx) {
        var behind = 0;
        var splits = e.legs.map(function(leg, idx) {
          var splitBehind = parseTime(leg.split) - parseTime(d.legs[idx].fastest);
          behind += splitBehind;
          return Split.create({
            number: idx + 1,
            code: leg.code,
            position: d.legs[idx].position,
            time: leg.time,
            behind: formatTime(behind),
            overallRank: leg.overallPosition,
            splitTime: leg.split,
            splitRank: leg.position,
            splitBehind: formatTime(splitBehind)
          });
        });
        return Runner.create({
          id: idx,
          rank: e.Rank,
          name: e.Name,
          firstName: e.Firstname,
          runTime: e.RunTime,
          checked: e.checked,
          splits: splits
        });
      });
      d.legs.forEach(function(d, idx) {
        d.number = idx + 1;
      });
      return {
        runners: runners,
        legs: d.legs
      };
    });
  },
  
  actions: {
    onleghover: function(leg) {
      this.controllerFor('runners.runner').set('hoverleg', leg);
    }
  }
    
});
