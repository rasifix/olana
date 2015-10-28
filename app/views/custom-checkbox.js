import Ember from 'ember';

export default Ember.Checkbox.extend({
  
  click: function (e) {
    e.stopPropagation();
  }
  
});