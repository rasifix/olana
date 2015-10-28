import Ember from 'ember';

export default Ember.Controller.extend({
  
  backRoute: 'legs',
  
  name: function() {
    return 'Strecke ' + this.get('model.id');
  }.property('model.id')
  
});