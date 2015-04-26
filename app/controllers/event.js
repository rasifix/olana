import Ember from 'ember';

export default Ember.Controller.extend({
  name: function() {
    return this.get('model.name');
  }.property('model.name')
});