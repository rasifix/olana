import Ember from 'ember';
import { parseTime } from 'olana/utils/time';

export default Ember.Object.extend({
    
  invalid: function() {
    return parseTime(this.get('time')) === null;
  }.property('time'),
  
  fullNameWithRank: function() {
    return this.get('fullName') + ' (' + this.get('rank') + ')';
  }.property('fullName', 'rank')
  
});