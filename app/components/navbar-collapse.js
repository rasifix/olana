import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({

  tagName: 'button',
  
  classNames: ['navbar-toggler'],
  
  type: 'button',

  "data-toggle": 'collapse',
  
  attributeBindings: ['type', 'data-toggle'],
  
  target: '#navbar-collapse',
  
  click: function() {
    $(this.get('target')).toggleClass('in');
  }
  
});