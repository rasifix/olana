import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  name: computed('model.id', function()  {
    return 'Strecke ' + this.get('model.id')
  })
  
});