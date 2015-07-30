import Ember from 'ember';

export default Ember.Controller.extend({
  
  backRoute: 'categories.index',
  
  graphWidth: 700,
  
  selectedDiff: function() {
    var diffs = this.get('model.diffs');
    var selectedOpponent = this.get('model.selectedOpponent');
    return diffs[selectedOpponent];
  }.property('model.diffs', 'model.selectedOpponent'),
  
  init: function() {
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