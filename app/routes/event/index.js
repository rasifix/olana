import Route from '@ember/routing/route';

export default Route.extend({
  
  beforeModel: function() {
    this.transitionTo('event.categories');
  }

});
