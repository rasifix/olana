/*global d3 */

import { parseTime, formatTime } from 'appkit/utils/time';

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ "perfindex-graph" ],
  
  // total width of component
  width: 940,
  
  // total height of component
  height: 400,
  
  // paddings for graph area
  padding: {
    left: 50,
    top: 5,
    right: 5,
    bottom: 40
  },
  
  didInsertElement: function() {
    this.refresh();
  },
  
  refresh: function() {    
    var data = this.get('data');
        
    var svg = d3.select(this.get('element'));
    
    var height = this.get('height');
    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
                
    var bars = svg.selectAll("rect").data(data);
    bars.enter().append("rect").on('mouseover', function(entry) { console.log(entry.key + '%'); });

    bars.transition()
        .attr("x", function(entry) { return xscale(entry.key); })
        .attr("y", function(entry) { return height - yscale(entry.value); })
        .attr("width", 16)
        .attr("height", function(entry) { return yscale(entry.value); })
        .attr("fill", "red");
    
    bars.exit().remove();    
  }.observes('data'),
  
  xscale: function() {
    var padding = this.get('padding.left');
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain([20, 140]);
  }.property('data'),
  
  yscale: function() {
    var max = d3.max(this.get('data'), function(entry) {
      return entry.value;
    });
    return d3.time.scale().range([0, this.get('height')]).domain([0, max]);
  }.property('data')

});
