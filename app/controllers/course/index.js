import Ember from 'ember';

export default Ember.ObjectController.extend({
  
  checkedRunners: function() {
    var runners = this.get('runners');
    return runners.filter(function(d) { return d.checked; });
  }.property('runners.@each.checked')
  
});