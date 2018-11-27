import Route from '@ember/routing/route';

export default Route.extend({
  
  model: function(params) {        
    var event = this.modelFor('event');
    return event.getLeg(params['leg_id']).then(function(leg) {
      if (!leg) {
        this.transitionTo('event.legs');
      }    
      return leg;
    });
  }

});
