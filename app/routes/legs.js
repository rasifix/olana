import Ember from 'ember';
import { Rainbow } from 'olana/utils/rainbow';

import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
        
    var runners = { };
    event.categories.forEach(function(c) {
      var category = parseRanking(JSON.parse(JSON.stringify(c)));
      category.runners.forEach(function(runner) {
        runners[runner.id] = runner;
      });
    });
    
    event.legs.forEach(function(leg) {
      var timeLosses = 0;
      leg.runners.forEach(function(runner) {
        var r = runners[runner.id];
        var s = r.splits.find(function(split) { return leg.id === split.leg; });
        if (s && s.timeLoss) {
          timeLosses += 1;
          runner.timeLoss = s.timeLoss;
        }
      });
      if (leg.runners.length > 0) {
        leg.errorFrequency = Math.round(100 * timeLosses / leg.runners.length);
        
        var colors = new Rainbow();
        colors.setSpectrum('green', 'yellow', 'orange', 'red');
        leg.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(leg.errorFrequency) + '; color:white; text-align:right; width:' + leg.errorFrequency * 4 + 'px';
        leg.style = leg.style.htmlSafe();
      }
    });
    
    event.legs.sort(function(l1, l2) {
      return l2.errorFrequency - l1.errorFrequency;
    });

    return {
      legs: event.legs,
      categories: event.categories
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
