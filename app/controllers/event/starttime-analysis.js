/* global d3 */

import Ember from 'ember';
import { parseTime, formatTime } from 'olana/utils/time';
import { median } from 'olana/utils/statistics';

export default Ember.ObjectController.extend({
  
  backRoute: 'event',
  
  trendlinePercentile: 25,
  
  groupBy: 30,
  
  selectedData: function() {
    var categories = new Ember.Set(this.get('checkedCategories'));
    return this.get('datapoints').filter(function(point) {
      return categories.contains(point.category);
    });
  }.property('checkedCategories', 'datapoints'),
  
  checkedCategories: function() {
    return this.get('availableCategories').filter(function(category) {
      return category.checked;
    }).map(function(category) {
      return category.name;
    });
  }.property('availableCategories.@each.checked'),
  
  datapoints: function() {
    var result = [];
    var categories = this.get('categories');
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
  }.property('categories'),
  
  availableCategories: function() {
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
    return d3.extent(this.get('datapoints').map(function(datapoint) { return datapoint.perfidx * 100; }));
  }.property('datapoints'),
  
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