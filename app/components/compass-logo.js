import Ember from 'ember';

function deg2rad(deg) {
  return deg * Math.PI / 180;
}

function arc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
  return 'A' + rx + ',' + ry + ',' + xAxisRotation + ',' + largeArcFlag + ',' + sweepFlag + ',' + x + ',' + y;
}

function move(x, y) {
  return 'M' + x + ',' + y;
}

function line(x, y) {
  return 'L' + x + ',' + y;
}

function ease(pos) {
  // pos [0..1]
  if (pos < 0.8) {
    var t = pos / 0.8;
    return t * t * t;
  }
  return 1 + Math.sin((pos - 0.8) / 0.2 * Math.PI) * 0.1;
}

export default Ember.Component.extend({
  
  tagName: 'svg',
  
  radius: 18,
  
  attributeBindings: ['width', 'height'],
  
  timer: null,
  
  northRotation: 300,
  
  rotation: 300,
  
  width: function() {
    return this.get('radius') * 2 + 4;
  }.property('radius'),
  
  height: function() {
    return this.get('radius') * 2 + 4;
  }.property('radius'),
  
  cx: function() {
    return this.get('width') / 2;
  }.property('width'),
  
  cy: function() {
    return this.get('height') / 2;
  }.property('height'),
  
  outerRadius: function() {
    return this.get('radius');
  }.property('radius'),
  
  innerRadius: 3,
  needleInnerRadius: 5,
  
  needlePath: function() {
    var cx = this.get('cx');
    var cy = this.get('cy');
    var radius = this.get('needleInnerRadius');
    
    var angle = deg2rad(45);
    
    // arc start
    var sx = cx + Math.sin(angle) * radius;
    var sy = cy - Math.cos(angle) * radius;
    
    // arc end
    var ex = sx;
    var ey = cy + Math.cos(angle) * radius;
    
    // tip of needle
    var tx = cx + this.get('radius') - 2;
    var ty = cy;
    
    return move(sx, sy) + ' ' + arc(radius, radius, 0, 0, 1, ex, ey) + ' ' + line(tx, ty);
  }.property('radius', 'cx', 'cy'),
  
  southNeedleTransform: function() {
    return 'rotate(180,' + this.get('cx') + ',' + this.get('cy') + ')';
  }.property('cx', 'cy'),
  
  transform: function() {
    var cx = this.get('cx');
    var cy = this.get('cy');
    return 'translate(' + cx + ',' + cy + ') rotate(' + this.rotation + ') translate(-' + cx + ',-' + cy + ')';
  }.property('cx', 'cy', 'rotation'),
  
  mouseEnter: function() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
  },
  
  mouseMove: function(e) {
    var deltaX = e.offsetX - this.get('width') / 2;
    var deltaY = -(e.offsetY - this.get('height') / 2);
    var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    this.set('rotation', 360 - angle);
  },
  
  mouseLeave: function() {
    var self = this;
    var startRotation = this.get('rotation');
    startRotation = startRotation >= 360 ? startRotation - 360 : startRotation;
    
    var delta = this.get('northRotation') - startRotation;
    var direction = delta > 180 ? -1 : 1;
    
    if (direction === -1) {
      delta = 360 - delta;
    }
    
    var startTime = Date.now();
    this.timer = window.setInterval(function() {
      var now = Date.now();
      var pos = (now - startTime) / 1000;
      if (pos >= 1) {
        pos = 1;
        window.clearInterval(self.timer);
      }
      self.set('rotation', startRotation + direction * ease(pos) * delta);
    }, 10);
  }
});
