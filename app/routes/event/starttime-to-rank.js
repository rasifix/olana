import Ember from 'ember';

export default Ember.Route.extend({
  
  hoverRunner: null,
  
  model: function(params) {
    var id = this.modelFor('event').id;
    return $.get(ENV.APP.API_HOST + 'api/events/' + id + '/starttime-to-rank/all');
  },
  
  actions: {
    runnerClicked: function(runner) {
      this.transitionTo('category.runner', runner.category, runner.id);
    },
    runnerOver: function(runner) {
      this.get('controller').set('hoverRunner', runner);
    }
  }

});
