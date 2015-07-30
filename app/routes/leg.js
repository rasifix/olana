import Ember from 'ember';

import { parseTime, formatTime } from 'olana/utils/time';

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
