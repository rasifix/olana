import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  backRoute: 'categories',
  
  name: computed('model.name', () => this.get('model.name'))
  
});
