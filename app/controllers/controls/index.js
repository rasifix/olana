import Ember from 'ember';

export default Ember.ObjectController.extend({
  
  queryParams: ['selectedControl'],
  
  backRoute: 'categories',
  
  selectedControl: '105',
  
  actions: {
    controlClicked: function(code) {
      this.set('selectedControl', code);
      //this.transitionTo('control', code);
    }
  }
    
});
