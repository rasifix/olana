import Ember from 'ember';

export default Ember.ObjectController.extend({
  
  backRoute: 'categories',
    
  checkedRunners: function() {
    var runners = this.get('runners');
    return runners.filter(function(d) { return d.checked; });
  }.property('runners.@each.checked')
  
});