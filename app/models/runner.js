import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Object.extend({
  fullName: function() {
    return this.get('firstName') + " " + this.get('name');
  }.property('Firstname', 'Name'),  
  
  fullNameWithRank: function() {
    return this.get('fullName') + " (" + this.get('rank') + ")";
  }.property('fullName', 'rank'),
  
  valid: function() {
    return parseTime(this.get('time')) !== null;
  }.property('time')
});