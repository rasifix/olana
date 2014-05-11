var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var categories = { };

var pad = function(str) {
  return str.length == 1 ? "0" + str : str;
};

function parseTime(str) {
  if (!str) {
    return -1;
  }
  var split = str.split(":");
  var result = parseInt(split[0]) * 3600 + parseInt(split[1]) * 60 + parseInt(split[2]);
  return isNaN(result) ? -1 : result;
};

function formatTime(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 3600) + ':' + pad("" + Math.floor(seconds % 3600 / 60)) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
};

function formatTime_min_s(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
};

function log(str) {
  process.stdout.write(str);
}

function line(str) {
  log(str + '\n');
}

function strip(str) {
  return str.substring(1, str.length - 1);
}

var first = true;

rl.on('line', function(cmd) {
  if (first) {
    first = false;
    return;
  }
  
  var cols = cmd.split(";");
  
  if (cols[14] !== '0') {
    return;
  }
  
  var runner = {
    name: strip(cols[5]),
    firstName: strip(cols[6]),
    yearOfBirth: cols[7],
    sex: strip(cols[8]),
    club: (strip(cols[19]) + ' ' + strip(cols[20])).trim(),
    city: strip(cols[43]),
    startTime: cols[11],
    finishTime: cols[12],
    runTime: cols[13],
    splits: []
  };
  
  var category = categories[strip(cols[25])];
  if (typeof category === 'undefined') {
    category = {
      name: strip(cols[25]),
      runners: []
    };
    categories[category.name] = category;
  }
  
  var split = null;
  for (var idx = 60; idx < 60 + parseInt(cols[56]) * 2; idx += 2) {
    if (idx === cols.length - 1) {
      continue;
    }
    split = {
      code: cols[idx],
      time: cols[idx + 1]
    };
    if (runner.splits.length === 0) {
      split.leg = 'St-' + split.code;
      split.split = split.time;
    } else {
      var previous = runner.splits[runner.splits.length - 1];
      split.leg = previous.code + '-' + split.code;
      split.split = formatTime(parseTime(split.time) - parseTime(previous.time));
    }
    runner.splits.push(split);
  }
  
  category.runners.push(runner);
}).on('close', function() {  
  line('// Format: Rank;Name;Firstname;YearOfBirth;SexMF;FedNr;Zip;Town;Club;NationIOF;StartNr;eCardNr;RunTime;StartTime;FinishTime;CtrlCode;SplitTime');
  line('//Nacht OL SM;Grauholz;2014-03-29;19:30;OLG Bern');
  for (var key in categories) {
    var category = categories[key];
    //reorganizeCategory(category);
    line(category.name);
    category.runners.forEach(function(runner, idx) {
      log((idx + 1) + ';' + runner.name + ';' + runner.firstName + ';' + runner.yearOfBirth + ';' + runner.sex + ';;;' + runner.city + ';' + runner.club + ';;;;' + formatTime_min_s(parseTime(runner.runTime)) + ';' + formatTime_min_s(parseTime(runner.startTime)) + ';' + formatTime_min_s(parseTime(runner.finishTime)));
      runner.splits.forEach(function(split) {
        log(';' + split.code + ';' + formatTime_min_s(parseTime(split.time)));
      });
      log('\n');
    });
  };
});

function reorganizeCategory(category) {
  var legs = category.runners[0].splits;
  
  for (var idx = 1; idx < category.runners.length; idx++) {
    var runner = category.runners[idx];
    var reorganized = [ ];
    for (var legIdx = 0; legIdx < legs.length; legIdx++) {
      var referenceSplit = legs[legIdx];
      var leg = referenceSplit.leg;
      if (leg) {
        var splits = runner.splits.filter(function(split) {
          return split.leg === leg;
        });
        if (splits.length === 1) {
          var split = splits[0];
          reorganized.push(split);
        }
      }
    }
    runner.splits = reorganized;
    for (var splitIdx = 0; splitIdx < runner.splits.length; splitIdx++) {
      var split = runner.splits[splitIdx];
      if (splitIdx === 0) {
        split.time = split.splitTime;
      } else {
        var previous = runner.splits[splitIdx - 1];
        split.time = formatTime(parseTime(previous.time) + parseTime(split.splitTime));
      }
    }
  }
}
