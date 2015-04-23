import Ember from 'ember';

export default Ember.Controller.extend({
  
  backRoute: 'categories',
    
  checkedRunners: function() {
    var runners = this.get('model.runners');
    return runners.filter(function(d) { return d.checked; });
  }.property('model.runners.@each.checked')
  
});