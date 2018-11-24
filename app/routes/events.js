import Route from '@ember/routing/route';

export default Route.extend({
  
  queryParams: {
    year: {
      refreshModel: true
    }
  },
  
  model: function(params) {
    var repository = this.get('repository');
    console.log(params.year);
    return repository.getEvents(params.year || new Date().getFullYear());
  },
  
  actions: {
    eventClicked: function(source, id) {
      this.transitionTo('event', source, id);
    }
  }

});
