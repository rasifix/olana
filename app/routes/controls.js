import Ember from 'ember';

import { parseTime, formatTime } from 'olana/utils/time';
import { parseRanking } from 'olana/utils/parser';
import { Rainbow } from 'olana/utils/rainbow';
import log from 'olana/utils/log';

export default Ember.Route.extend({
    
  model: function() {
    return this.modelFor('event').getControls().then(function(data) {
      var categories = [];
      data.forEach(function(control) {
        control.categories.forEach(function(category) {
          if (categories.indexOf(category) === -1) {
            categories.push(category);
          } 
        });
      });
      
      var colors = new Rainbow();
      colors.setSpectrum('green', 'yellow', 'orange', 'red');
      
      data.forEach(function(control) {
        control.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(control.errorFrequency) + '; color:white; text-align:right; width:' + control.errorFrequency * 4 + 'px';
        control.style = control.style.htmlSafe();
      });
      return {
        controls: data,
        categories: categories.sort(function(s1, s2) { return s1.localeCompare(s2); })
      };
    });    
  },
  
  actions: {
    controlClicked: function(code) {
      
    }
  }

});
