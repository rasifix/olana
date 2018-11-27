import EmberObject from '@ember/object';
import { parseTime } from 'olana/utils/time';
import { computed } from '@ember/object';

export default EmberObject.extend({
    
  invalid: computed('time', function() {
    return parseTime(this.get('time')) === null;
  }),
  
  fullNameWithRank: computed('fullName', 'rank', function() {
    return this.get('fullName') + ' (' + this.get('rank') + ')';
  })
  
});