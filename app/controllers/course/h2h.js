import Ember from 'ember';

export default Ember.Controller.extend({
  
  selectedDiff: function() {
    var diffs = this.get('model.diffs');
    var selectedOpponent = this.get('model.selectedOpponent');
    return diffs[selectedOpponent];
  }.property('model.diffs', 'model.selectedOpponent')
  
});