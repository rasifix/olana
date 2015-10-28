import Ember from 'ember';

export default Ember.Route.extend({
  
  queryParams: {
    year: {
      refreshModel: true
    }
  },
  
  model: function(params) {
    var repository = this.get('repository');    
    return repository.getEvents(params.year || new Date().getFullYear());
  },
  
  actions: {
    eventClicked: function(source, id) {
      this.transitionTo('event', source, id);
    }
  }

});
