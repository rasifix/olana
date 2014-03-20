export default Ember.Component.extend({
  classNames: [ "ranking-list" ],
  
  actions: {
    runnerClicked: function(runner) {
      this.sendAction('action', runner);
    }
  }
});
