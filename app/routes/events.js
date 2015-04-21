import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var repository = this.get('repository');
    return repository.getEvents();
  },
  
  actions: {
    eventClicked: function(source, id) {
      this.transitionTo('event', source, id);
    }
  }

});
