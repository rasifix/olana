import Route from '@ember/routing/route';

import { Rainbow } from 'olana/utils/rainbow';

export default Route.extend({
    
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
        try {
          let style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(control.errorFrequency) + '; color:white; text-align:right; width:' + control.errorFrequency + '%';
          control.style = style;
        } catch (e) {
          console.error(e);
        }
      });
      return {
        controls: data,
        categories: categories.sort(function(s1, s2) { return s1.localeCompare(s2); })
      };
    });    
  },
  
  actions: {
    controlClicked: function() {
      // what do we do with it?
    }
  }

});
