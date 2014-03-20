var parseTime = function(str) {
  var split = str.split(":");
  return parseInt(split[0]) * 60 + parseInt(split[1]);
};

var pad = function(str) {
  return str.length == 1 ? "0" + str : str;
};

var formatTime = function(seconds) {
  if (seconds >= 0) {
    return Math.floor(seconds / 60) + ":" + pad("" + seconds % 60);
  } else {
    return "-" + Math.floor(-seconds / 60) + ":" + pad("" + -seconds % 60);
  }
};

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: [ "h2h-graph" ],
  
  width: 920,
  
  barheight: 20,
  
  height: function() {
    return this.get('legs').length * (this.get('barheight') + 1);
  }.property('legs'),
  
  center: function() {
    return this.get('width') / 2 - 0.5;
  }.property('width'),
  
  didInsertElement: function() {
    this.refresh();
  },
  
  refresh: function() {    
    var legs = this.get('legs');
        
    var center = this.get('width') / 2;
    var xscale = this.get('xscale');
    var barheight = this.get('barheight');
    
    var bars = d3.select(this.get('element')).selectAll("rect").data(legs);
    bars.enter().append("rect");

    bars.transition()
        .attr("x", function(leg) { return leg.diff < 0 ? center : center - xscale(leg.diff); })
        .attr("y", function(leg, idx) { return idx * (barheight + 1); })
        .attr("width", function(leg) { return leg.diff === 0 ? 0 : (leg.diff < 0 ? -xscale(leg.diff) : xscale(leg.diff)); })
        .attr("height", barheight)
        .attr("fill", function(leg) { return leg.diff < 0 ? '#0A0' : '#A00'; });
    
    bars.exit().remove();    
    
    var labels = d3.select(this.get('element')).selectAll("text").data(legs);
    labels.enter().append("text");
    
    labels.transition()
          .attr("x", function(leg) { return center - xscale(leg.diff) + (leg.diff < 0 ? 5 : -5); })
          .attr("y", function(leg, idx) { return idx * (barheight + 1) + 14; })
          .attr("text-anchor", function(leg) { return leg.diff < 0 ? 'start' : 'end'; })
          .attr("stroke", function(leg) { return leg.diff < 0 ? '#0A0' : '#A00'; })
          .attr("opacity", function(leg) { return leg.diff === 0 ? 0 : 1})
          .text(function(leg) { return '+' + formatTime(Math.abs(leg.diff)); });
    
    labels.exit().remove();
    
  }.observes('legs'),
  
  xscale: function() {
    var maxdiff = d3.max(this.get('legs'), function(leg) {
      return leg.diff < 0 ? -leg.diff : leg.diff;
    });
    var padding = 50;
    return d3.time.scale().range([0, this.get('width') / 2 - padding]).domain([0, maxdiff]);
  }.property('legs')

});
