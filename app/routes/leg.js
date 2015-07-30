import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function(params) {        
    var event = this.modelFor('event');
    return event.getLeg(params['leg_id']).then(function(leg) {
      if (!leg) {
        this.transitionTo('legs');
      }    
      console.log(leg);
      return leg;
    });
  }

});
