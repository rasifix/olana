import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.ObjectController.extend({
  
  backRoute: 'categories',
  
  name: 'Startzeit / Rang',
  
  selectedData: function() {
    var categories = new Ember.Set(this.get('checkedCategories'));
    return this.get('datapoints').filter(function(point) {
      return categories.contains(point.category);
    });
  }.property('checkedCategories', 'datapoints'),
  
  checkedCategories: function() {
    return this.get('categories').filter(function(category) {
      return category.checked;
    }).map(function(category) {
      return category.name;
    });
  }.property('categories.@each.checked'),
  
  categories: function() {
    var datapoints = this.get('datapoints');
    var categories = new Ember.Set();
    datapoints.forEach(function(point) {
      categories.add(point.category);
    });
    return categories.toArray().map(function(category) {
      return {
        name: category,
        checked: true
      }
    });
  }.property('datapoints'),
  
  xdomain: function() {
    var data = this.get('datapoints');
    return d3.extent(data.map(function(point) { return parseTime(point.startTime); }));
  }.property('datapoints'),
  
  ydomain: function() {
    var max = d3.max(this.get('datapoints'), function(point) {
      return parseInt(point.rank);
    });
    return [0, max];
  }.property('datapoints')
  
});