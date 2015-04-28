import Ember from 'ember';

export default Ember.Controller.extend({
  
  backRoute: 'legs',
  
  name: function() {
    return this.get('model.name');
  }.property('model.name')
  
});
