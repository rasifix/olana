/* global $ */

import Ember from 'ember';
import config from '../config/environment';
import { parseTime, formatTime } from 'olana/utils/time';

var order = [ 'HE', 
            'HAL', 'HAM', 'HAK', 'HB', 
            'H35', 'H40', 'H45', 'H50', 'H55', 'H60', 'H65', 'H70', 'H75', 'H80',
            'H20', 'H18', 'H16', 'H14', 'H12', 'H10', 
            'DE', 
            'DAL', 'DAM', 'DAK', 'DB', 
            'D35', 'D40', 'D45', 'D50', 'D55', 'D60', 'D65', 'D70', 'D75', 'D80',
            'D20', 'D18', 'D16', 'D14', 'D12', 'D10',
            'OL', 'OM', 'OK'
          ];

function categorySort(c1, c2) {
  var idx1 = order.indexOf(c1.name);
  var idx2 = order.indexOf(c2.name);

  if (idx1 === -1 && idx2 === -1) {
    return 0;
  } else if (idx1 === -1) {
    return 1;
  } else if (idx2 === -1) {
    return -1;
  } else {
    return idx1 - idx2;
  }
}

function defineCourses(categories) {
  var groupedCategories = { };
  categories.forEach(function(category) {
    if (category.runners.length === 0) {
      // category without runners are ignored
      return;
    }

    // find categories with identical courses
    var controls = category.runners[0].splits.map(function(split) { return split[0]; }).join('-');
    if (!groupedCategories[controls]) {
      groupedCategories[controls] = [];
    }
    groupedCategories[controls].push(category);
  });
  
  // build courses
  var courses = [];
  Object.keys(groupedCategories).forEach(function(grouped) {
    var cats = groupedCategories[grouped];
    var idx = 0;
    var id = cats.map(function(cat) { return cat.name; }).sort().join('-');
    courses.push({ 
      id: id,
      name: id,
      distance: cats[0].distance,
      ascent: cats[0].ascent,
      controls: cats[0].controls,
      runners: cats.reduce(function(prev, cat) { 
        return prev.concat(cat.runners.map(function(runner) {
          return {
            id: idx++,
            startTime: runner.startTime,
            yearOfBirth: runner.yearOfBirth,
            time: runner.time,
            sex: runner.sex,
            ecard: runner.ecard,
            splits: runner.splits,
            club: runner.club,
            fullName: runner.fullName,
            nation: runner.nation,
            city: runner.city,
            category: cat.name
          };
        })); 
      }, [ ])
    });
  });
  
  // emit an entry for each course
  courses.sort(function(c1, c2) { 
    if (c1.id < c2.id) {
      return -1;
    } else if (c1.id > c2.id) {
      return 1;
    } else {
      return 0;
    }    
  }).forEach(function(course) {
    // sort the runners according to their run time
    course.runners.sort(function(r1, r2) {
      var t1 = parseTime(r1.time);
      var t2 = parseTime(r2.time);
      if (t1 === null && t2 === null) {
        return 0;
      } else if (t1 !== null && t2 === null) {
        return -1;
      } else if (t1 === null && t2 !== null) {
        return 1;
      } else {
        return parseTime(r1.time) - parseTime(r2.time);
      }
    });
  });
  
  return courses;
}

function isValid(value) {
  return value !== '-' && value !== 's';
}

function controlOrdinal(id) {
  if (id === 'St') {
    return -1000;
  } else if (id === 'Zi') {
    return 1000;
  } else {
    return parseInt(id, 10);
  }
}

function legOrdinal(id) {
  var split = id.split('-');
  return controlOrdinal(split[0]) * 1000 + controlOrdinal(split[1]);
} 

function legSort(l1, l2) {
  return legOrdinal(l1.id) - legOrdinal(l2.id);
}


function defineLegs(categories) {
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
  var lastSplit = null;
  categories.forEach(function(category) {        
    category.runners.forEach(function(runner) {
      var lastTime = null;
      var lastControl = 'St';
      
      runner.splits.forEach(function(split) {
        var control = split.code;
        var time = split.time;
        var code = lastControl + '-' + control;
        if (!legs[code]) {
          legs[code] = {
            id: code,
            categories: { },
            runners: []
          };
        }
        if (isValid(time) && (lastTime == null || isValid(lastTime))) {
          var splitTime = lastTime !== null ? parseTime(time) - parseTime(lastTime) : parseTime(time);
          legs[code].runners.push(createRankingEntry(runner, category.name, splitTime));
          legs[code].categories[category.name] = true;
          lastSplit = split;
        }
      
        lastControl = control;
        lastTime = time;
      });
    
      if (lastSplit !== null) {
        var ziCode = lastControl + '-' + 'Zi';
        if (!legs[ziCode]) {
          legs[ziCode] = {
            id: ziCode,
            categories: { },
            runners: []
          };
        }
        if (isValid(lastTime) && parseTime(runner.time)) {
          var ziTime = parseTime(runner.time) - parseTime(lastTime);
          legs[ziCode].runners.push(createRankingEntry(runner, category.name, ziTime));
          legs[ziCode].categories[category.name] = true;
        }
      }
    });
  });
  
  // convert legs hash into array
  var result = [];
  Object.keys(legs).forEach(function(code) {
    var leg = legs[code];
    leg.runners.sort(function(s1, s2) {
      return parseTime(s1.split) - parseTime(s2.split);
    });
    leg.categories = Object.keys(leg.categories);
    result.push(leg);
  });
  result.sort(legSort);
  
  return result;
}

function time(name) {
  if (console.time) {
    console.time(name);
  }
}

function timeEnd(name) {
  if (console.timeEnd) {
    console.timeEnd(name);
  }
}

export default Ember.Object.extend({
  
  getEvents: function() {
    time('fetchEvents');
    return $.get(config.APP.API_HOST + 'api/events').then(function(data) {
      timeEnd('fetchEvents');
      return data.events;
    });
  },
  
  getEvent: function(source, id) {
    time('fetchEvent.' + id);
    return $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id).then(function(data) {
      timeEnd('fetchEvent.' + id);

      // correct sort order of categories (so sort order is always the same)
      time('fetchEvent.' + id + '.prepare');
      
      // transform data structure from wire-optimal to code-optimal
      data.categories.forEach(function(category) {
        category.runners.forEach(function(runner) {
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
      });    
      
      data.categories = data.categories.sort(categorySort);
      data.courses = defineCourses(data.categories);
      data.legs = defineLegs(data.categories);
      timeEnd('fetchEvent.' + id + '.prepare');
      
      return data;
    });
  }
  
});