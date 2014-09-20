import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'tr',
    
  actions: {
    clicked: function() {
      this.sendAction('action', this.get('runner'));
    }
  }
  
});
