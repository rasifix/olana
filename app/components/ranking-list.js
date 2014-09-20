import Ember from 'ember';

export default Ember.Component.extend({
  classNames: [ 'ranking-table' ],
  tagName: 'table',
  
  actions: {
    runnerClicked: function(runner) {
      this.sendAction('action', runner);
    }
  }
});
