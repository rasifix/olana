import Ember from 'ember';

export default Ember.ObjectController.extend({
  
  selectedDiff: function() {
    var diffs = this.get('diffs');
    var selectedOpponent = this.get('selectedOpponent');
    return diffs[selectedOpponent];
  }.property('diffs', 'selectedOpponent')
  
});