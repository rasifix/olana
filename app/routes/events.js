export default Ember.Route.extend({
  
  model: function() {
    return $.getJSON("/events.json");
  },
  
  actions: {
    eventClicked: function(id) {
      this.transitionTo('event', id);
    }
  }

});
