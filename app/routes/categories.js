import Route from '@ember/routing/route';

export default Route.extend({
    
  model: function() {
    return this.modelFor('event').getCategories().then(function(data) {
      return {
        categories: data
      };
    });
  },

});
