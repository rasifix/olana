import Ember from 'ember';

export default Ember.Controller.extend({
  
  queryParams: ['selectedCategory'],
  
  backRoute: 'categories',
  
  categories: function() {
    var categories = this.get('model.categories');
    return categories.map(function(category) { return category.name; });
  }.property('model.categories'),
  
  filteredControls: function() {
    var selection = this.get('selectedCategory');
    var result = this.get('model.controls');
    if (selection && selection != null && selection !== "null") {
      result = result.filter(function(control) {
        return control.cats.indexOf(selection) != -1;
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
