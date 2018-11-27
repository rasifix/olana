import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  queryParams: ['selectedCategory'],
  
  filteredControls: computed('model.controls', 'selectedCategory', function() {
    var selection = this.get('selectedCategory');
    var result = this.get('model.controls');
    if (selection && selection !== null && selection !== "null") {
      result = result.filter(function(control) {
        return control.categories.indexOf(selection) !== -1;
      });
    }
    return result;
  }),
  
  actions: {
    controlClicked: function(code) {
      this.transitionToRoute('event.controls.control', code);
    }
  }
    
});
