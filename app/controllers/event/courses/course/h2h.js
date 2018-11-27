import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  selectedDiff: computed('model.{diffs,selectedOpponent}', function() {
    var diffs = this.get('model.diffs');
    var selectedOpponent = this.get('model.selectedOpponent');
    return diffs[selectedOpponent];
  })
  
});