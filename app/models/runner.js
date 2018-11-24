import EmberObject from '@ember/object';
import { parseTime } from 'olana/utils/time';
import { computed } from '@ember/object';

export default EmberObject.extend({
    
  invalid: computed('time', () => parseTime(this.get('time')) === null),
  
  fullNameWithRank: computed('fullName', 'rank', () => this.get('fullName') + ' (' + this.get('rank') + ')')
  
});