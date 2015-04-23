import Ember from 'ember';

export default Ember.Controller.extend({
  
  queryParams: ['selectedControl'],
  
  backRoute: 'categories',
  
  actions: {
    controlClicked: function(code) {
      this.transitionTo('control', code);
    }
  }
    
});
