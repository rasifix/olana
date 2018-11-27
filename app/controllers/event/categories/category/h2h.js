import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  graphWidth: 700,
  
  selectedDiff: computed('model.{diffs,selectedOpponent}', function() {
    var diffs = this.get('model.diffs');
    var selectedOpponent = this.get('model.selectedOpponent');
    console.log('selected opponent = ' + selectedOpponent);
    return diffs[selectedOpponent];
  }),
  
  init() {
    this._super(...arguments);
    var self = this;
    window.onresize = function() {
      self.refreshGraphWidth();
    };
    this.refreshGraphWidth();
  },
  
  refreshGraphWidth: function() {
    if (window.screen.availWidth >= 768) {
      this.set('graphWidth', 768 - 2 * 15 - 18);
    } else {
      this.set('graphWidth', window.screen.availWidth - 2 * 15);
    }
  }
  
});