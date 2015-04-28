import Ember from 'ember';

export default Ember.Controller.extend({
  
  queryParams: ['selectedCategory'],
  
  backRoute: 'categories',
  
  categories: function() {
    var categories = this.get('model.categories');
    return categories.map(function(category) { return category.name; });
  }.property('model.categories'),
  
  filteredLegs: function() {
    var selection = this.get('selectedCategory');
    var result = this.get('model.legs');
    if (selection && selection !== null && selection !== "null") {
      result = result.filter(function(leg) {
        return leg.categories.indexOf(selection) != -1;
      });
    }
    return result;
  }.property('model.legs', 'selectedCategory'),
  
});