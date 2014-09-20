import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: function() {
    return this.get('name');
  }.property('name')
});