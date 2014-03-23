export default Ember.Route.extend({
  
  deserialize: function(params) {
    var event = this.modelFor('event');
    var category = null;
    event.categories.forEach(function(cat) {
      if (cat.name === params.category_id) {
        category = cat;
        return;
      }
    });
    category.id = params.category_id;
    return category;
  },
  
  actions: {
    onleghover: function(leg) {
    },
    onlegclick: function(leg) {
      this.transitionTo('event.leg', leg.leg);
    }
  },
  
  model: function(params) {
    return [];
  }

});
