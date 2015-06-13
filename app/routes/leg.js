import Ember from 'ember';

import { parseTime, formatTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  model: function(params) {        
    var event = this.modelFor('event');
    var leg = event.getLeg(params['leg_id']);
    if (!leg) {
      this.transitionTo('legs');
    }    
    return leg;
  }

});
