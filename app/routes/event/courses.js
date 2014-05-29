export default Ember.Route.extend({
  
  deserialize: function(params) {
    var event = this.modelFor('event');
    return {
      courses: event.courses,
      name: 'Bahnen'
    };
  },
  
  actions: {
    courseClicked: function(name) {
      this.transitionTo('event.course', name);
    }
  },
  
  model: function(params) {
    // totally irrelevant...
    return [];
  }

});
