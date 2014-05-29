export default Ember.Route.extend({
  
  deserialize: function(params) {
    return {
      name: params.course_id
    };
  },
  
  actions: {
    onlegclick: function(leg) {
      this.transitionTo('event.leg', leg.leg);
    }
  },
  
  model: function(params) {
    // totally irrelevant...
    return [];
  }

});
