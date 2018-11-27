import Route from '@ember/routing/route';

export default Route.extend({
  
  model: function(params) {
    var source = params['source'];
    var id = params['event_id'];
    var repository = this.get('repository');
    return repository.getEvent(source, id);
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('event.categories.category', name);
    },
    legClicked: function(name) {
      this.transitionTo('event.legs.leg', name);
    }
  }

});
