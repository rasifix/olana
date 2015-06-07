/* global d3 */

import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Controller.extend({
  
  backRoute: 'event',
  
  checkedCategories: function() {
    return this.get('availableCategories').filter(function(category) {
      return category.checked;
    }).map(function(category) {
      return category.name;
    });
  }.property('availableCategories.@each.checked'),
  
  availableCategories: function() {
    var categories = this.get('model.categories');
    return categories.map(function(category) {
      return {
        name: category,
        checked: true
      };
    }); 
  }.property('model.categories'),
  
  buckets: function() {
    var buckets = [];
    for (var i = 0; i <= 20; i++) {
      buckets[i] = 0;
    }
    
    var timeLosses = this.get('model.timeLosses');
    var checkedCategories = this.get('checkedCategories');
    timeLosses.filter(function(timeLoss) { return checkedCategories.indexOf(timeLoss.category) !== -1; }).forEach(function(timeLoss) {
      var bucketIndex = Math.round(timeLoss.position * 20);
      var bucket = buckets[bucketIndex];
      buckets[bucketIndex] += 1;
    });
    return buckets;
  }.property('model.timeLosses', 'checkedCategories'),
  
  xdomain: function() {
    var data = this.get('buckets');
    return [0, data.length];
  }.property('buckets'),
  
  ydomain: function() {
    return [0, d3.max(this.get('buckets'))];
  }.property('buckets'),
  
  actions: {
    selectAll: function() {
      this.get('availableCategories').forEach(function(cat) {
        Ember.set(cat, 'checked', true);
      });
    },
    selectNone: function() {
      this.get('availableCategories').forEach(function(cat) {
        Ember.set(cat, 'checked', false);
      });
    }
  }
  
});
