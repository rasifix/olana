/* global d3 */

import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height', 'xmlns'],
  classNames: [ "erroranalysis-graph" ],
  xmlns: 'http://www.w3.org/2000/svg',
  
  // total width of component
  width: 756,
  
  // total height of component
  height: 400,
  
  // paddings for graph area
  padding: {
    left: 20,
    top: 5,
    right: 0,
    bottom: 15
  },
  
  area: function() {
    return {
      x: this.get('padding.left'),
      y: this.get('padding.top'),
      width: this.get('width') - this.get('padding.left') - this.get('padding.right'),
      height: this.get('height') - this.get('padding.top') - this.get('padding.bottom')
    };
  }.property('width', 'height'),
  
  didInsertElement: function() {
    d3.select(this.get('element')).append('g').attr('class', 'y');
    this.refresh();
  },
  
  refresh: function() {    
    var buckets = this.get('buckets');    
    var svg = d3.select(this.get('element'));

    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
        
    var bars = svg.selectAll('rect').data(buckets);
    
    bars.enter()
         .append('rect')
         .attr('x', function(bucket, idx) { return xscale(idx); })
         .attr('y', yscale(0))
         .attr('width', 10)
         .attr('height', 0);
    
    bars.transition()
        .attr('y', function(bucket) { return yscale(bucket); })
        .attr('height', function(bucket) { return yscale(0) - yscale(bucket); });
    
    bars.exit().remove().transition()
        .attr('height', 0)
        .attr('y', yscale(0));
    
    var yAxis = d3.svg.axis()
            .scale(d3.scale.linear().range([this.get('height') - this.get('padding.top'), this.get('padding.top')]))
            .orient("left");
            
    svg.select('g.y')
       .attr("class", "y axis")
       .attr("transform", "translate(30, 0)")
       .call(yAxis);
    
  }.observes('buckets'),
    
  xscale: function() {
    var padding = this.get('padding.left') + 2;
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain(this.get('xdomain'));
  }.property('xdomain'),
  
  yscale: function() {
    var padding = this.get('padding.top') + this.get('padding.bottom');
    return d3.scale.linear().range([this.get('height') - padding, padding]).domain(this.get('ydomain'));
  }.property('ydomain')
  
});
