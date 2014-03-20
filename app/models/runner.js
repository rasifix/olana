export default Ember.Object.extend({
  fullName: function() {
    return this.get('firstName') + " " + this.get('name');
  }.property('Firstname', 'Name'),  
  
  fullNameWithRank: function() {
    return this.get('fullName') + " (" + this.get('rank') + ")";
  }.property('fullName', 'rank')
});