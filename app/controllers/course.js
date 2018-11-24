import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  backRoute: 'courses',
  
  name: computed('model.name', () => this.get('model.name'))
  
});
