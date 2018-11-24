import Checkbox from '@ember/component/checkbox';

export default Checkbox.extend({
  
  click: function (e) {
    e.stopPropagation();
  }
  
});