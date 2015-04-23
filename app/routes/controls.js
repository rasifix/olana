import Ember from 'ember';

import { parseTime, formatTime } from 'olana/utils/time';
import { parseRanking } from 'olana/utils/parser';
import { Rainbow } from 'olana/utils/rainbow';

export default Ember.Route.extend({
  
  parseData: function(data) {
    var categories = data.categories;
    var legs = { };
    var all = { };

    categories.filter(function(cat) { return cat.runners.length > 0; }).forEach(function(cat) {
      var category = parseRanking(cat);
      
      category.runners[0].splits.forEach(function(split, idx) {
        if (idx === 0) {
          legs['St-' + split.code] = { source: 'St', target: split.code };
        } else if (idx <= category.runners[0].splits.length - 1) {
          var prev = category.runners[0].splits[idx - 1];
          legs[prev.code + '-' + split.code] = { source: prev.code, target: split.code };
        } 
        
        if (idx === category.runners[0].splits.length - 1) {
          legs[split.code + '-' + 'Zi'] = { source: split.code, target: 'Zi' };
        }
      });
      
      category.runners.forEach(function(runner) {
        runner.splits.forEach(function(split, idx) {
          if (!all[split.code]) {
            all[split.code] = { 
              code: split.code,
              categories: { }
            };
          }
                    
          // prepare the value
          var control = all[split.code];
          
          if (!control.categories[category.name]) {
            control.categories[category.name] = {
              name: category.name,
              from: idx === 0 ? 'St' : runner.splits[idx - 1].code,
              to: idx === runner.splits.length - 1 ? 'Zi' : runner.splits[idx + 1].code,
              runners: [ ]
            };
          }
          
          var cat = control.categories[category.name];
          
          if (idx === 0 && parseTime(split.time)) {  
            cat.runners.push({
              fullName: runner.fullName,
              splitTime: split.time,
              timeLoss: split.timeLoss
            });
          } else if (idx > 0 && parseTime(split.time) && parseTime(runner.splits[idx - 1].time)) {
            cat.runners.push({
              fullName: runner.fullName,
              splitTime: formatTime(parseTime(split.time) - parseTime(runner.splits[idx - 1].time)),
              timeLoss: split.timeLoss
            });
          }
        });
      });      
    });
    
    var result = [ ];
    Object.keys(all).forEach(function(code) {
      var control = all[code];
      control.categories = Object.keys(control.categories).map(function(name) {
        return control.categories[name];
      });
      var errors = 0;
      var total = 0;
      control.categories.forEach(function(category) {
        category.runners.sort(function(r1, r2) {
          return parseTime(r1.splitTime) - parseTime(r2.splitTime);
        });
        total += category.runners.length;
        category.runners.forEach(function(runner) {
          if (runner.timeLoss) {
            errors += 1;
          }
        });
      });
      control.errorFrequency = Math.round(errors / total * 100);
      
      var colors = new Rainbow();
      colors.setSpectrum('green', 'yellow', 'orange', 'red');
      if (control.errorFrequency) {
        control.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(control.errorFrequency) + '; color:white; text-align:right; width:' + control.errorFrequency * 4 + 'px';
        control.style = control.style.htmlSafe();
      } else {
        console.log('no error frequency for control ' + code);
      }
      control.cats = control.categories.map(function(cat) { return cat.name; }).join(',');
      result.push(control);
    });
    result.sort(function(c1, c2) {
      return c2.errorFrequency - c1.errorFrequency;
    });
    
    return result;
  },
  
  model: function() {
    var event = this.modelFor('event');
    if (!event.controls) {
      event.controls = this.parseData(event);
    }
    return event;
  },
  
  actions: {
    controlClicked: function(code) {
      console.log('control clicked: ' + code);
    }
  }

});
