/* global d3 */

import { set } from '@ember/object';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  backRoute: 'event',
  
  checkedCategories: computed('availableCategories.@each.checked', function() {
    return this.get('availableCategories').filter(function(category) {
      return category.checked;
    }).map(function(category) {
      return category.name;
    });
  }),
  
  availableCategories: computed('model.categories', function() {
    var categories = this.get('model.categories');
    return categories.map(function(category) {
      return {
        name: category,
        checked: true
      };
    }); 
  }),
  
  buckets: computed('model.timeLosses', 'checkedCategories', function() {
    var buckets = [];
    for (var i = 0; i <= 20; i++) {
      buckets[i] = 0;
    }
    
    var timeLosses = this.get('model.timeLosses');
    var checkedCategories = this.get('checkedCategories');
    timeLosses.filter(function(timeLoss) { return checkedCategories.indexOf(timeLoss.category) !== -1; }).forEach(function(timeLoss) {
      var bucketIndex = Math.round(timeLoss.position * 20);
      buckets[bucketIndex] += 1;
    });
    return buckets;
  }),
  
  xdomain: computed('buckets', () => [0, this.get('buckets').length]),
  
  ydomain: computed('buckets', () => [0, d3.max(this.get('buckets'))]),
  
  actions: {
    selectAll: function() {
      this.get('availableCategories').forEach(function(cat) {
        set(cat, 'checked', true);
      });
    },
    selectNone: function() {
      this.get('availableCategories').forEach(function(cat) {
        set(cat, 'checked', false);
      });
    }
  }
  
});
