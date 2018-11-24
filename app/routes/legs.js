import Route from '@ember/routing/route';

import { Rainbow } from 'olana/utils/rainbow';

export default Route.extend({
  
  model: function() {
    return this.modelFor('event').getLegs().then(function(data) {
      var categories = [];
      data.forEach(function(leg) {
        leg.categories.forEach(function(category) {
          if (categories.indexOf(category) === -1) {
            categories.push(category);
          } 
        });
      });
      
      var colors = new Rainbow();
      colors.setSpectrum('green', 'yellow', 'orange', 'red');
      
      data.forEach(function(leg) {
        leg.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(leg.errorFrequency) + '; color:white; text-align:right; width:' + leg.errorFrequency + '%';
        leg.style = leg.style.htmlSafe();
      });
      
      return {
        legs: data,
        categories: categories.sort(function(s1, s2) { return s1.localeCompare(s2); })
      };
    });
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
