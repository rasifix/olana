/* global d3 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';

var pad = function(str) {
  return str.length === 1 ? "0" + str : str;
};

var formatTime = function(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
};

export default Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ "h2h-graph" ],
  
  // total width of component
  width: 700,
  
  // height of individual bar
  barheight: 24,
  
  // offset for leg number on the left side
  offset: 40,
  
  height: computed('legs', function() {
    return this.get('legs').length * (this.get('barheight') + 1);
  }),
  
  center: computed('width', function() {
    return this.get('width') / 2 - 0.5;
  }),
  
  didInsertElement: function() {
    this.refresh();
  },
  
  refresh: observer('legs', 'width', function() {    
    var legs = this.get('legs');
    
    function linearGradient(defs, id) {
      var grad = defs.append('linearGradient');
      grad.attr('id', id);
      var stop1 = grad.append('stop');
      stop1.attr('class', id + '-start').attr('offset', '0%');
      var stop2 = grad.append('stop');
      stop2.attr('class', id + '-end').attr('offset', '100%');
    }
    
    var svg = d3.select(this.get('element'));
    var defs = svg.append('defs');
    linearGradient(defs, 'positive');
    linearGradient(defs, 'negative');
    
    var offset = this.get('offset');
    var center = offset + (this.get('width') - offset) / 2;
    var xscale = this.get('xscale');
    var barheight = this.get('barheight');
        
    var legbg = d3.select(this.get('element')).selectAll("rect.leg").data(legs);
    legbg.enter().append("rect").attr("class", "leg");
    
    legbg.transition()
         .attr("x", 0)
         .attr("y", function(leg, idx) { return idx * (barheight + 1); })
         .attr("width", this.get('width'))
         .attr("height", barheight);
        
    var bars = d3.select(this.get('element')).selectAll("rect.time-bar").data(legs);
    bars.enter().append("rect");

    bars.transition()
        .attr("x", function(leg) { return leg.diff < 0 ? center : center - xscale(leg.diff); })
        .attr("y", function(leg, idx) { return idx * (barheight + 1); })
        .attr("width", function(leg) { return leg.diff === 0 ? 0 : (leg.diff < 0 ? -xscale(leg.diff) : xscale(leg.diff)); })
        .attr("height", barheight)
        .attr("class", function(leg) { return leg.diff === 0 ? 'time-bar' : (leg.diff < 0 ? 'time-bar positive' : 'time-bar negative'); });
    
    bars.exit().remove();    
    
    var labels = d3.select(this.get('element')).selectAll("text.time-diff").data(legs);
    labels.enter().append("text").attr("class", "time-diff");
    
    labels.transition()
          .attr("x", function(leg) { return center - xscale(leg.diff) + (leg.diff < 0 ? 5 : -5); })
          .attr("y", function(leg, idx) { return idx * (barheight + 1) + 16; })
          .attr("text-anchor", function(leg) { return leg.diff < 0 ? 'start' : 'end'; })
          .text(function(leg) { return '+' + formatTime(Math.abs(leg.diff)); });
    
    labels.exit().remove();
    
    var legsText = d3.select(this.get('element')).selectAll("text.leg").data(legs);
    legsText.enter().append("text").attr("class", "leg");
    
    legsText.transition()
        .attr("x", "20")
        .attr("y", function(leg, idx) { return idx * (barheight + 1) + 16; })
        .text(function(leg) { return leg.number; });
    
  }),
  
  xscale: computed('legs', 'width', function() {
    var maxdiff = d3.max(this.get('legs'), function(leg) {
      return leg.diff < 0 ? -leg.diff : leg.diff;
    });
    var padding = 50;
    return d3.time.scale().range([0, (this.get('width') - this.get('offset')) / 2 - padding]).domain([0, maxdiff]);
  })

});
