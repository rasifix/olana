import Route from '@ember/routing/route';

export default Route.extend({
  
  model: function() {
    return this.modelFor('event').getStartTime();
  },
  
  actions: {
    runnerClicked: function(runner) {
      this.transitionTo('event.categories.category.runner', runner.category, runner.id);
    },
    runnerOver: function(runner) {
      this.get('controller').set('hoverRunner', runner);
    }
  }

});
