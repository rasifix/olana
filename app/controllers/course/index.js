import Ember from 'ember';
import log from 'olana/utils/log';

export default Ember.Controller.extend({
  
  backRoute: 'courses',

  checkedRunners: function() {
    var runners = this.get('model.runners');
    return runners.filter(function(d) { return d.checked; });
  }.property('model.runners.@each.checked'),
  
  actions: {
    onlegclick: function(leg) {
      this.set('selectedLeg', leg);
    }
  }
  
  
});