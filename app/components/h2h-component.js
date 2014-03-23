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
  
  // total width of component
  width: 940,
  
  // height of individual bar
  barheight: 24,
  
  // offset for leg number on the left side
  offset: 40,
  
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
    bars.enter().append("rect").attr("class", "time-bar");

    bars.transition()
        .attr("x", function(leg) { return leg.diff < 0 ? center : center - xscale(leg.diff); })
        .attr("y", function(leg, idx) { return idx * (barheight + 1); })
        .attr("width", function(leg) { return leg.diff === 0 ? 0 : (leg.diff < 0 ? -xscale(leg.diff) : xscale(leg.diff)); })
        .attr("height", barheight)
        .attr("fill", function(leg) { return leg.diff < 0 ? '#0A0' : '#A00'; });
    
    bars.exit().remove();    
    
    var labels = d3.select(this.get('element')).selectAll("text.time-diff").data(legs);
    labels.enter().append("text").attr("class", "time-diff");
    
    labels.transition()
          .attr("x", function(leg) { return center - xscale(leg.diff) + (leg.diff < 0 ? 5 : -5); })
          .attr("y", function(leg, idx) { return idx * (barheight + 1) + 16; })
          .attr("text-anchor", function(leg) { return leg.diff < 0 ? 'start' : 'end'; })
          //.attr("opacity", function(leg) { return leg.diff === 0 ? 0 : 1})
          .text(function(leg) { return '+' + formatTime(Math.abs(leg.diff)); });
    
    labels.exit().remove();
    
    var legs = d3.select(this.get('element')).selectAll("text.leg").data(legs);
    legs.enter().append("text").attr("class", "leg");
    
    legs.transition()
        .attr("x", "20")
        .attr("y", function(leg, idx) { return idx * (barheight + 1) + 16; })
        .text(function(leg) { return leg.number; });
    
  }.observes('legs'),
  
  xscale: function() {
    var maxdiff = d3.max(this.get('legs'), function(leg) {
      return leg.diff < 0 ? -leg.diff : leg.diff;
    });
    var padding = 50;
    return d3.time.scale().range([0, (this.get('width') - this.get('offset')) / 2 - padding]).domain([0, maxdiff]);
  }.property('legs')

});
