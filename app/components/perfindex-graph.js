/* global d3 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';

export default Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ "perfindex-graph" ],
  
  // total width of component
  width: 756,
  
  // total height of component
  height: 400,
  
  // paddings for graph area
  padding: null,

  init() {
    this._super(...arguments);
    this.padding = {
      left: 50,
      top: 5,
      right: 5,
      bottom: 40
    };
  },
  
  didInsertElement: function() {
    this.refresh();
  },
  
  refresh: observer('data', function() {    
    var data = this.get('data');
        
    var svg = d3.select(this.get('element'));
    
    var height = this.get('height');
    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
                
    var bars = svg.selectAll("rect").data(data);
    //bars.enter().append("rect").on('mouseover', function(entry) { console.log(entry.key + '%'); });

    bars.transition()
        .attr("x", function(entry) { return xscale(entry.key); })
        .attr("y", function(entry) { return height - yscale(entry.value); })
        .attr("width", 16)
        .attr("height", function(entry) { return yscale(entry.value); })
        .attr("fill", "red");
    
    bars.exit().remove();    
  }),
  
  xscale: computed('data', function() {
    var padding = this.get('padding.left');
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain([20, 160]);
  }),
  
  yscale: computed('data', function() {
    var max = d3.max(this.get('data'), function(entry) {
      return entry.value;
    });
    return d3.time.scale().range([0, this.get('height')]).domain([0, max]);
  })

});
