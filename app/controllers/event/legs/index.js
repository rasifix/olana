import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  queryParams: ['selectedCategory'],
    
  filteredLegs: computed('model.legs', 'selectedCategory',function() {
    var selection = this.get('selectedCategory');
    var result = this.get('model.legs');
    if (selection && selection !== null && selection !== "null") {
      result = result.filter(function(leg) {
        return leg.categories.indexOf(selection) !== -1;
      });
    }
    return result;
  }),
  
});