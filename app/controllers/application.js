import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  
  name: 'Resultate',
  
  years: computed(function() {
    var year = new Date().getFullYear();
    var result = [];
    for (var i = 0; i < 5; i++) {
      result.push(year - i);
    }
    return result;
  })
    
});