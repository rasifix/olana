import Ember from 'ember';

export default Ember.Component.extend({
  classNames: [ 'row' ],
  tagName: 'div',
  
  actions: {
    runnerClicked: function(runner) {
      runner.set('showSplits', !runner.get('showSplits'));
    },
    checkboxClicked: function(runner, e) {
      console.log('checkboxClicked');
      console.log(e);
    }
  }
});
