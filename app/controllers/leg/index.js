import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  backRoute: 'legs',
  
  name: computed('model.id', () => 'Strecke ' + this.get('model.id'))
  
});