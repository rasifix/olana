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
    return category;
  },
  
  actions: {
    onleghover: function(leg) {
      this.controllerFor('event.category.runner').set('hoverleg', leg);
    },
    onlegclick: function(leg) {
      console.log("leg clicked");
    }
  },
  
  model: function(params) {
    return [];
  }

});
