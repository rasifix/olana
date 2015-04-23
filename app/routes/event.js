import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function(params) {
    var source = params['source'];
    var id = params['event_id'];
    var repository = this.get('repository');
    return repository.getEvent(source, id);
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('category', name);
    },
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
