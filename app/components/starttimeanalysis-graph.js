/* global d3 */

import Component from '@ember/Component';
import { parseTime } from 'olana/utils/time';
import { groupBy } from 'olana/utils/statistics';
import { computed, observer } from '@ember/object';


var crisp = function(value) {
  return Math.round(value - 0.5) + 0.5;
};

export default Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height', 'xmlns'],
  classNames: [ "startimerank-graph" ],
  xmlns: 'http://www.w3.org/2000/svg',
  
  // total width of component
  width: 756,
  
  // total height of component
  height: 400,
  
  // trendline percentile
  trendlinePercentile: 0.25,
  
  // grouping of start times
  groupBy: 15,
  
  // paddings for graph area
  padding: null,

  init() {
    this._super(...arguments);
    this.padding = {
      left: 20,
      top: 5,
      right: 0,
      bottom: 15
    };
  },
  
  area: computed('width', 'height', function() {
    return {
      x: this.get('padding.left'),
      y: this.get('padding.top'),
      width: this.get('width') - this.get('padding.left') - this.get('padding.right'),
      height: this.get('height') - this.get('padding.top') - this.get('padding.bottom')
    };
  }),
  
  hover: null,
  
  didInsertElement: function() {
    var svg = d3.select(this.get('element'));
    
    var height = this.get('height');
    svg.append('text').attr('x', this.get('width') / 2).attr('y', height - 5).attr('text-anchor', 'middle').attr('font-size', '16px').text('Startzeit');
    
    this.refresh();
  },
  
  refresh: observer('data', 'hover', 'trendlinePercentile', 'groupFactor', function() {    
    var data = this.get('data');    
    var svg = d3.select(this.get('element'));

    var xscale = this.get('xscale');
    var yscale = this.get('yscale');
    
    var self = this;
    
    this.updateVGrid(svg);    
    this.updateHGrid(svg);
    
    var trendlines = [ this.get('trendline') ];
    var path = svg.selectAll("path.trendline").data(trendlines);
    
    var lineFunction = d3.svg.line().x(function(d) { return d.x; })
                                    .y(function(d) { return d.y; })
                                    .interpolate('linear');
    
    path.enter()
        .append("path")
        .attr("class", "trendline")
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", 'red')
        .attr("stroke-width", '2')
        .attr("fill", "none");
    
    // update the existing line
    path.transition()
        .attr("d", function(line) { return lineFunction(line); })
        .attr("stroke", '#aaa')
        .attr("stroke-width", '1')
        .duration(500);
      
    var dots = svg.selectAll('circle').data(data, function(value) { return value.id; });
    dots.enter().append('circle').on('click', function(point) { 
      self.sendAction('runnerClicked', point);
    }).on('mouseover', function(point) {
      self.set('hover', point);
      self.sendAction('runnerOver', point);
    }).on('mouseout', function(/*point*/) {
      self.set('hover', null);
    }).attr('opacity', 0)  
      .attr("fill", function(point) { return point.sex === 'M' ? 'dodgerblue' : 'darkorchid'; });

    dots.transition().duration(10)
        .attr("cx", function(point) { return xscale(parseTime(point.startTime)); })
        .attr("cy", function(point) { return yscale(point.perfidx * 100); })
        .attr("opacity", function(point) { return point.category === self.get('hover.category') ? '1.0' : '0.5'; })
        .attr('r', (point) => point.category === self.get('hover.category') ? 4 : 2);
    
    dots.exit().remove().transition().duration(10).attr('opacity', 0).attr('r', 0);
        
  }),
  
  updateVGrid: function(svg) {
    var xscale = this.get('xscale');
    var yscale = this.get('yscale');

    var lines = svg.selectAll('line.vgrid').data(this.get('groups'));
    lines.enter().append('line')
         .attr('x1', function(d) { return xscale(d); })
         .attr('x2', function(d) { return xscale(d); })
         .attr('y1', yscale(this.get('ydomain')[0]))
         .attr('y2', yscale(this.get('ydomain')[1]))
         .attr('class', 'vgrid')
         .attr('stroke', '#aaa')
         .attr('opacity', 0.25);
    lines.transition().duration(500)
        .attr("x1", function(d) { return crisp(xscale(d)); })
        .attr("x2", function(d) { return crisp(xscale(d)); });
    lines.exit().remove();
  },
  
  updateHGrid: function(svg) {
    var y = this.get('yscale');
            
    var hline = svg.selectAll("line.hgrid").data(y.ticks());
        
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
  
  trendline: computed('data', 'trendlinePercentile', 'groupFactor', function() {
    var datapoints = this.get('data');
    
    var groupFactor = this.get('groupFactor');
    var zeroTime = this.get('xdomain')[0];
    
    var grouping = function(datapoint) {
      var time = parseTime(datapoint.startTime);
      return Math.floor((time - zeroTime) / groupFactor);
    };
    
    var grouped = groupBy(datapoints, grouping);
    grouped.sort(function(g1, g2) {
      return parseTime(g1[0].startTime) - parseTime(g2[0].startTime);
    });
        
    var x = this.get('xscale');
    var y = this.get('yscale');
    var trendlinePercentile = this.get('trendlinePercentile') / 100;
    
    var trendline = [];
        
    grouped.forEach(function(group) {
      var gid = grouping(group[0]);
      group.sort(function(g1, g2) { return g2.perfidx - g1.perfidx; });
      var percentile = d3.quantile(group.map(function(p) { return p.perfidx; }), trendlinePercentile);
      var bucket = zeroTime + gid * groupFactor + groupFactor / 2;
      trendline.push({ x: x(bucket), y: y(percentile * 100) });
    });
        
    return trendline;
  }),
  
  xscale: computed('xdomain', function() {
    var padding = this.get('padding.left') + 2;
    return d3.scale.linear().range([padding, this.get('width') - padding]).domain(this.get('xdomain'));
  }),
  
  yscale: computed('ydomain', function() {
    var padding = this.get('padding.top') + this.get('padding.bottom');
    return d3.scale.linear().range([this.get('height') - padding, padding]).domain(this.get('ydomain'));
  }),
  
  groupFactor: computed('groupBy', function() {
    var groupBy = this.get('groupBy');
    return groupBy * 60;
  }),
  
  groups: computed('xdomain', 'groupFactor', function() {
    var domain = this.get('xdomain');
    var s = domain[0];
    var e = domain[1];
    var groupFactor = this.get('groupFactor');
    
    var first = s;
    var last = s + Math.ceil((e - s) / groupFactor) * groupFactor;
        
    var result = [];
    for (var i = first; i <= last; i += groupFactor) {
      if (this.get('xscale')(i) > this.get('padding.left')) {
        result.push(i);
      }
    }
    
    return result;
  })
  
  
});
