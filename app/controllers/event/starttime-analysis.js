/* global d3 */

import Set from '@ember/set';
import Controller from '@ember/controller';
import { parseTime } from 'olana/utils/time';
import { set } from '@ember/object';
import { computed } from '@ember/object';

export default Controller.extend({
  
  backRoute: 'event',
  
  trendlinePercentile: 25,
  
  groupBy: 30,
  
  selectedData: computed('checkedCategories', 'datapoints', function() {
    var categories = new Set(this.get('checkedCategories'));
    return this.get('datapoints').filter(function(point) {
      return categories.contains(point.category);
    });
  }),
  
  checkedCategories: computed('availableCategories.@each.checked', function() {
    return this.get('availableCategories').filter(function(category) {
      return category.checked;
    }).map(function(category) {
      return category.name;
    });
  }),
  
  datapoints: computed('categories', function() {
    var result = [];
    var categories = this.get('model.categories');
    categories.forEach(function(category) {
      var times = category.runners.slice(0, Math.min(category.runners.length, 5)).map(function(runner) { return parseTime(runner.time); });
      var idealtime = d3.sum(times) / times.length;
      category.runners.forEach(function(runner) {
        runner.perfidx = idealtime / parseTime(runner.time);
        runner.perfidxLabel = (runner.perfidx * 100).toFixed(1) + '%';
        result.push(runner);
      });
    });
    return result;
  }),
  
  availableCategories: computed('datapoints', function() {
    var datapoints = this.get('datapoints');
        
    var categories = new Set();
    datapoints.forEach(function(point) {
      categories.add(point.category);
    });
    return categories.toArray().map(function(category) {
      return {
        name: category,
        checked: true
      };
    });
  }),
  
  xdomain: computed('datapoints', function() {
    var data = this.get('datapoints');
    return d3.extent(data.map(function(point) { return parseTime(point.startTime); }));
  }),
  
  ydomain: computed('datapoints', function() {
    return d3.extent(this.get('datapoints').map(function(datapoint) { return datapoint.perfidx * 100; }));
  }),
  
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