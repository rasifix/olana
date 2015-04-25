import Ember from 'ember';

export default Ember.Controller.extend({
  
  backRoute: 'courses',
  
  name: function() {
    return this.get('model.name');
  }.property('model.name')
  
});
