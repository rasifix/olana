/*global d3 */

import Component from '@ember/component';
import Set from '@ember/set';
import { computed, observer } from '@ember/object';

export default Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: ['control-network'],
  
  width: 758,
  height: 300,
  
  currentControl: null,
  
  didInsertElement: function() {  
    this.refresh();
  },
  
  refresh: observer('visibleControls.[]', 'currentControl', function() {
    var svg = d3.select(this.get('element'));
    
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

    function tick() {
      lines.attr('x1', function(d) { return d.source.x; })
           .attr('y1', function(d) { return d.source.y; })
           .attr('x2', function(d) { return d.target.x; })
           .attr('y2', function(d) { return d.target.y; });
      
      var selected = that.get('currentControl');
      circles.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; })
        .attr('fill', function(d) { return selected && selected.code === d.code ? 'magenta' : 'none'; });
    }

  }),
  
  links: computed('legs', 'controls', function() {
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
  }),
  
  nodes: computed('controls', () => this.get('controls')),
  
  visibleControls: computed('controls.[]', 'currentControl', function() {
    var controls = this.get('controls');
    
    var all = [];
    all.push({ code:'St', level:0 });
    
    var currentCode = this.get('currentControl');
    
    var current = controls.find(function(control) { return control.code === currentCode; });
    var result = [ { xpos:1, ypos:0.5, code:current.code } ];
    
    var incoming = new Set();
    var outgoing = new Set();
    current.categories.forEach(function(category) {
      if (category.from) {
        incoming.push(category.from);
      }
      if (category.to) {
        outgoing.push(category.to);
      }
    });
    
    incoming.forEach(function(code, idx) {
      result.push({ xpos:0, ypos:(1 + idx)/(incoming.length + 1), code:code });
    });
    
    outgoing.forEach(function(code, idx) {
      result.push({ xpos:2, ypos:(1 + idx)/(outgoing.length + 1), code:code });
    });
    
    return result;
  })
  
});
