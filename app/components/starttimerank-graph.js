/* global d3 */

import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ "perfindex-graph" ],
  
  // total width of component
  width: 756,
  
  // total height of component
  height: 400,
  
  // paddings for graph area
  padding: {
    left: 5,
    top: 5,
    right: 5,
    bottom: 5
  },
  
  hover: null,
  
  didInsertElement: function() {
    this.refresh();
  },
  
  refresh: function() {    
    var data = this.get('data');    
    var svg = d3.select(this.get('element'));
    
    var height = this.get('height');
    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
    
    var self = this;
    
    var dots = svg.selectAll('circle').data(data, function(value) { return value.id; });
    dots.enter().append('circle').on('click', function(point) { 
      self.sendAction('runnerClicked', point);
    }).on('mouseover', function(point) {
      self.set('hover', point);
      self.sendAction('runnerOver', point);
    }).on('mouseout', function(point) {
      self.set('hover', null);
    }).attr('opacity', 0)  
      .attr("fill", function(point) { return point.sex === 'M' ? 'dodgerblue' : 'darkorchid'; });

    dots.transition().duration(250)
        .attr("cx", function(point) { return xscale(parseTime(point.startTime)); })
        .attr("cy", function(point) { return height - yscale(parseInt(point.rank)); })
        .attr("opacity", function(point) { return point.category === self.get('hover.category') ? '1.0' : '0.5' })
        .attr('r', function(point) { return point === self.get('hover') ? 4 : 3 });
    
    dots.exit().remove().transition().duration(250).attr('opacity', 0).attr('r', 0);
  }.observes('data', 'hover'),
  
  xscale: function() {
    var padding = this.get('padding.left');
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain(this.get('xdomain'));
  }.property('xdomain'),
  
  yscale: function() {
    var padding = this.get('padding.top');
    return d3.time.scale().range([padding, this.get('height') - padding]).domain(this.get('ydomain'));
  }.property('ydomain')
  
  
});
