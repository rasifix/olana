export default Ember.Component.extend({
  classNames: [ "splits-list" ],
  
  actions: {
    splitHover: function(split) {
      this.sendAction('splitHover', split);
    }
  }  
});
