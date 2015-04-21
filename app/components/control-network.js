/*global d3, Rainbow */

import Ember from 'ember';
import { parseTime } from 'olana/utils/time';
import { Rainbow } from 'olana/utils/rainbow';

var lineFunction = d3.svg.line().x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .interpolate("linear");

var colors = new Rainbow();
    
export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: ['control-network'],
  
  width: 758,
  height: 300,
  
  currentControl: null,
  
  didInsertElement: function() {  
    this.refresh();
  },
  
  refresh: function() {
    var svg = d3.select(this.get('element'));
    
    var cx = this.get('width') / 2;
    var cy = this.get('height') / 2;
    var dx = this.get('width') / 4;
    var width = this.get('width');
    var height = this.get('height');
    
    var nodes = this.get('nodes');
    var links = this.get('links');
    var that = this;
    
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .distance(30)
        .size([width, height])
        .on('tick', tick)
        .start();
    
    var circles = svg.selectAll('circle').data(nodes, function(control) { return control.code; });
    circles.enter()
           .append('circle')
           .attr('cx', function(d) { return d.x; })
           .attr('cy', function(d) { return d.y; })
           .attr('r', 10)
           .attr('fill', 'none')
           .attr('stroke', 'magenta')
           .call(force.drag);
    
     
    var lines = svg.selectAll('line').data(links);
    lines.enter()
        .append('line')
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; })
        .attr('stroke', 'magenta');

    function tick(e) {
      lines.attr('x1', function(d) { return d.source.x; })
           .attr('y1', function(d) { return d.source.y; })
           .attr('x2', function(d) { return d.target.x; })
           .attr('y2', function(d) { return d.target.y; });
      
      var selected = that.get('currentControl');
      circles.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; })
        .attr('fill', function(d) { return selected && selected.code === d.code ? 'magenta' : 'none'; });
    }

  }.observes('visibleControls.[]', 'currentControl'),
  
  links: function() {
    var legs = this.get('legs');
    var controls = this.get('controls');
    var result = [];
    legs.forEach(function(leg) {
      var source = controls.find(function(control) { return control.code === leg.source; });
      var target = controls.find(function(control) { return control.code === leg.target; });
      if (source && target) {
        result.push({ source: source, target: target });
      }
    });
    return result;
  }.property('legs', 'controls'),
  
  nodes: function() {
    return this.get('controls');
  }.property('controls'),
  
  visibleControls: function() {
    var controls = this.get('controls');
    
    var all = [];
    all.push({ code:'St', level:0 });
    
    var currentCode = this.get('currentControl');
    
    var current = controls.find(function(control) { return control.code === currentCode; });
    var result = [ { xpos:1, ypos:0.5, code:current.code } ];
    
    var incoming = new Ember.Set();
    var outgoing = new Ember.Set();
    current.categories.forEach(function(category) {
      if (category.from) {
        incoming.push(category.from);
      }
      if (category.to) {
        outgoing.push(category.to);
      }
    });
    
    incoming.forEach(function(code, idx) {
      var control = controls.find(function(control) { return control.code === code; });
      result.push({ xpos:0, ypos:(1 + idx)/(incoming.length + 1), code:code });
    });
    
    outgoing.forEach(function(code, idx) {
      var control = controls.find(function(control) { return control.code === code; });
      result.push({ xpos:2, ypos:(1 + idx)/(outgoing.length + 1), code:code });
    });
    
    return result;
  }.property('controls.[]', 'currentControl')
  
});
