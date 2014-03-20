export default Ember.ObjectController.extend({

  activeRunnerObserver: function() {
    console.log("ACTIVE RUNNER CHANGED");
  }.observes('activeRunner'),
  
  highlightObserver: function() {
    console.log("hoverleg changed");
  }.observes('hoverleg')

});