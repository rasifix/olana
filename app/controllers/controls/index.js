import Ember from 'ember';

export default Ember.Controller.extend({
  
  queryParams: ['selectedCategory'],
  
  backRoute: 'categories',
  
  filteredControls: function() {
    var selection = this.get('selectedCategory');
    var result = this.get('model.controls');
    if (selection && selection !== null && selection !== "null") {
      result = result.filter(function(control) {
        return control.categories.indexOf(selection) != -1;
      });
    }
    return result;
  }.property('model.controls', 'selectedCategory'),
  
  actions: {
    controlClicked: function(code) {
      this.transitionToRoute('control', code);
    }
  }
    
});
