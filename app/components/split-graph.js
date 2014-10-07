/*global d3, Rainbow */

import Ember from 'ember';
import { parseTime } from 'olana/utils/time';
import { Rainbow } from 'olana/utils/rainbow';

var pad = function(str) {
  return str.length === 1 ? "0" + str : str;
};

var flatten = function(arr) {
  return [].concat.apply([], arr);
};

var lineFunction = d3.svg.line().x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .interpolate("linear");

var colors = new Rainbow();
    
export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ 'split-graph' ],
  
  width: 758,
  height: 600,
  
  padding: {
    left: 50,
    top: 5,
    right: 5,
    bottom: 40
  },
  
  area: function() {
    var padding = this.get('padding');
    return {
      width: this.get('width') - padding.left - padding.right,
      height: this.get('height') - padding.top - padding.bottom
    };
  }.property('padding', 'width', 'height'),
  
  didInsertElement: function() {  
    this.refresh();
  },
  
  refresh: function() {
    var self = this;
    var grid = d3.select(this.get('element')).select("#grid");
    var legs = this.get('legs');
    var x = this.get('xScale');    
    var padding = this.get('padding');
    
    var hover = grid.selectAll("rect.hover").data(legs);
    hover.enter()
         .append("rect")
         .classed("hover", true)
         .attr("x", function(leg, idx) { return idx === 0 ? x(0) : x(legs[idx - 1].position); })
         .attr("y", padding.top)
         .attr("width", function(leg, idx) { 
           var start = idx === 0 ? x(0) : x(legs[idx - 1].position);
           var w = x(leg.position) - start;
           return w;
         })
         .attr("height", this.get('area').height)
         .attr("fill", "white")
         .attr("opacity", 0.5)
         .on("click", function(leg) {
           self.sendAction('legclick', leg);
         })
         .on("mouseover", function(leg) {
           self.sendAction('leghover', leg);
         });
    
    var labels = grid.selectAll("text.xaxis").data(legs.filter(function(d, idx) { return idx % 2 === 1; }));
    labels.enter()
          .append("text")
          .classed("xaxis", true)
          .attr("x", function(d) { return x(d.position); })
          .attr("y", this.get('height') - this.get('padding').bottom + 10)
          .text(function(d, idx) { return (idx + 1) * 2; });
    
    this.updateSplitLines();
    this.updateHGrid();        
  }.observes('runners.[]', 'active'),
  
  updateSplitLines: function() {
    var svg = d3.select(this.get('element'));
    
    var lines = this.timelines();
    colors.setNumberRange(0, Math.max(1, lines.length));
    
    var path = svg.selectAll("path.timeline").data(lines, function(line) { return line.get('key'); });
    
    var activeRunner = this.get('active');
    
    path.enter()
        .append("path")
        .attr("class", "timeline")
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", function(e, idx) { return "#" + colors.colorAt(idx); })
        .attr("stroke-width", function(e) { return activeRunner && e.key === activeRunner.get('fullName') ? 3 : 1.3; })
        .attr("opacity", 0)
        .attr("fill", "none");
    
    // update the existing lines
    path.transition()
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", function(e, idx) { return "#" + colors.colorAt(idx); })
        .attr("stroke-width", function(e) { return activeRunner && e.key === activeRunner.get('fullName') ? 3 : 1.3; })
        .attr("opacity", 1)
        .duration(500);
        
    path.exit().transition().attr("opacity", 0).remove();
  },
  
  updateHGrid: function() {
    var svg = d3.select(this.get('element'));
    var x = this.get('xScale');
    var y = this.get('yScale');
        
    var hline = svg.select("g#hgrid").selectAll("line").data(y.ticks(), function(d) { return d.getTime(); });
    
    var crisp = function(value) {
      return Math.round(value - 0.5) + 0.5;
    };
    
    hline.enter()
       .append("line")
       .attr("x1", x(0))
       .attr("x2", x(1))
       .attr("y1", function(d) { return crisp(y(d)); })
       .attr("y2", function(d) { return crisp(y(d)); })
       .attr("opacity", 0)
       .attr("stroke", "#aaa");
        
    hline.transition().duration(500).attr("opacity", 1)
         .attr("y1", function(d) { return crisp(y(d)); })
         .attr("y2", function(d) { return crisp(y(d)); })
         .attr("opacity", 1);
    
    hline.exit().transition().duration(500).attr("opacity", 0).remove();
    
    var htext = svg.select("g#hgrid").selectAll("text").data(y.ticks().slice(1), function(d) { return d.getTime(); });
    
    htext.enter()
       .append("text")
       .attr("x", 45)
       .attr("y", function(d) { return y(d) + 3; })
       .attr("opacity", 0)
       .text(function(d) { 
         var seconds = Math.abs(d.getTime()) / 1000;
         var minutes = Math.floor(seconds / 60);
         return (d.getTime() < 0 ? '-' : '+') + minutes + ":" + pad("" + seconds % 60); 
       });
    
    htext.transition().duration(500).attr("y", function(d) { return y(d) + 3; }).attr("opacity", 1);
    
    htext.exit().transition().duration(500).attr("opacity", 0).remove();
  },
  
  // TODO: make timelines dependent on active mode
  timelines: function() {
    var runners = this.get('runners');
    var x = this.get('xScale');
    var y = this.get('yScale');
    
    var timelines = [];
    runners.forEach(function(runner) {
      var points = [ { x: x(0), y: y(0) }];
      points.key = runner.get('fullName');
      runner.get('splits').forEach(function(split) {
        points.push({ x: x(split.position), y: y(parseTime(split.idealBehind) * 1000) });
      });
      timelines.addObject(points);
    });
    
    return timelines;
  },
  
  vgrid: function() {
    var legs = this.get('legs');
    var x = this.get('xScale');
    var path = ['M0,0'];
    
    for (var i = 0; i < legs.length; i++) {
      var leg = legs[i];
      var xpos = x(leg.position);
      xpos = Math.round(xpos - 0.5) + 0.5;
      path.push('M', xpos, ',', this.get('padding').top, 'V', this.get('height') - this.get('padding').bottom);
    }
    return path.join('');
  }.property("legs").cacheable(),
  
  xScale: function() {
    return d3.scale.linear().domain([0, 1]).range([this.get('padding').left, this.get('width') - this.get('padding').right]);
  }.property(),
  
  hgrid: function() {    
    var y = this.get('yScale');
    var path = ['M0,0'];
            
    var ticks = y.ticks();
    for (var i = 0; i < ticks.length; i++) {
      var tick = ticks[i];
      path.push('M', 0, ',', y(tick), 'H', this.get('width'));
    }
    
    return path.join('');    
  },

  yScale: function() {
    var runners = this.get('runners');
    
    var times = flatten(runners.map(function(runner) {
      return runner.splits.map(function(split) {
        if (split.idealBehind) {
          return parseTime(split.idealBehind) * 1000;
        }
        return 0;        
      });
    }));
    
    // everything starts at zero (no handicap ;) ).
    times.push(0);
    
    return d3.time.scale().range([this.get('padding').top, this.get('height') - this.get('padding').bottom]).domain(d3.extent(times));
  }.property('runners')

});
