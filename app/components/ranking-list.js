import Component from '@ember/component';

export default Component.extend({
  classNames: [ 'row' ],
  tagName: 'div',
  
  actions: {
    runnerClicked: function(runner) {
      runner.set('showSplits', !runner.get('showSplits'));
    },
    checkboxClicked: function(runner) {
      runner.set('checked', !runner.checked);
    }
  }
});
