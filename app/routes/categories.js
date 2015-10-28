import Ember from 'ember';

export default Ember.Route.extend({
    
  model: function() {
    return this.modelFor('event').getCategories().then(function(data) {
      return {
        categories: data
      };
    });
  },

});
