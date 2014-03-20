export default Ember.Component.extend({
  
  actions: {
    clicked: function(e) {
      this.sendAction('action', this.get('runner'));
    }
  }
  
});
