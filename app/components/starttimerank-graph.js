/* global d3 */

import Ember from 'ember';
import { parseTime, formatTime } from 'olana/utils/time';
import { groupBy } from 'olana/utils/statistics';

var lineFunction = d3.svg.line().x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .interpolate("linear");

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
    left: 20,
    top: 5,
    right: 5,
    bottom: 15
  },
  
  hover: null,
  
  didInsertElement: function() {
    var svg = d3.select(this.get('element'));
    var height = this.get('height');
    svg.append('text').attr('x', this.get('width') / 2).attr('y', height - 5).attr('text-anchor', 'middle').attr('font-size', '16px').text('Startzeit');
    
    this.refresh();
  },
  
  refresh: function() {    
    var data = this.get('data');    
    var svg = d3.select(this.get('element'));

    var height = this.get('height');
    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
    
    var self = this;
    
    this.updateHGrid(svg);
    
    var trendline = this.get('trendline');
    var path = svg.selectAll("path.trendline").data([trendline]);
    
    path.enter()
        .append("path")
        .attr("class", "trendline")
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", 'red')
        .attr("stroke-width", '2')
        .attr("opacity", 0)
        .attr("fill", "none");
    
    // update the existing line
    path.transition()
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", 'black')
        .attr("stroke-width", '2')
        .attr("opacity", 1/3)
        .duration(500);
      
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

    dots.transition().duration(10)
        .attr("cx", function(point) { return xscale(parseTime(point.startTime)); })
        .attr("cy", function(point) { return yscale(point.perfidx * 100); })
        .attr("opacity", function(point) { return point.category === self.get('hover.category') ? '1.0' : '0.5'; })
        .attr('r', function(point) { return point.category === self.get('hover.category') ? 4 : 2; });
    
    dots.exit().remove().transition().duration(10).attr('opacity', 0).attr('r', 0);
        
  }.observes('data', 'hover'),
  
  updateHGrid: function(svg) {
    var x = this.get('xscale');
    var y = this.get('yscale');
            
    var hline = svg.selectAll("line.hgrid").data(y.ticks());
    
    var crisp = function(value) {
      return Math.round(value - 0.5) + 0.5;
    };
    
    hline.enter()
       .append("line")
       .attr("class", "hgrid")
       .attr("x1", this.get('padding.left'))
       .attr("x2", this.get('width'))
       .attr("y1", function(d) { return crisp(y(d)); })
       .attr("y2", function(d) { return crisp(y(d)); })
       .attr("opacity", 0)
       .attr("stroke", "#aaa");
        
    hline.transition().duration(500).attr("opacity", 1)
         .attr("y1", function(d) { return crisp(y(d)); })
         .attr("y2", function(d) { return crisp(y(d)); })
         .attr("opacity", 1/3);
    
    hline.exit().transition().duration(500).attr("opacity", 0).remove();
    
    var htext = svg.selectAll("text.hgrid").data(y.ticks());
    
    htext.enter()
       .append("text")
       .attr("class", "hgrid")
       .attr('text-anchor', 'end')
       .attr("x", this.get('padding.left') - 3)
       .attr("y", function(d) { return y(d) + 3; })
       .attr("opacity", 1)
       .text(function(d) { return d; });    
  },
  
  trendline: function() {
    var datapoints = this.get('data');
    
    var grouping = function(datapoint) {
      return Math.floor(parseTime(datapoint.startTime) / 60 / 15);
    };
    
    var grouped = groupBy(datapoints, grouping);
    grouped.sort(function(g1, g2) {
      return parseTime(g1[0].startTime) - parseTime(g2[0].startTime);
    });
        
    var x = this.get('xscale');
    var y = this.get('yscale');

    var trendline = [];
        
    grouped.forEach(function(group) {
      var gid = grouping(group[0]);
      group.sort(function(g1, g2) { return g2.perfidx - g1.perfidx; });
      var median = d3.quantile(group.map(function(p) { return p.perfidx; }), 0.2);
      var bucket = gid * 60 * 15 + 7.5 * 60;
      trendline.push({ x: x(bucket), y: y(median * 100) });
    });
        
    return trendline;
  }.property('data'),
  
  xscale: function() {
    var padding = this.get('padding.left') + 2;
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain(this.get('xdomain'));
  }.property('xdomain'),
  
  yscale: function() {
    var padding = this.get('padding.top') + this.get('padding.bottom');
    return d3.scale.linear().range([this.get('height') - padding, padding]).domain(this.get('ydomain'));
  }.property('ydomain')
  
  
});
