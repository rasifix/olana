/* global $ */

import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'button',
  
  classNames: ['navbar-toggle'],
  
  type: 'button',
  
  attributeBindings: ['type'],
  
  target: '#navbar-collapse',
  
  click: function() {
    console.log('gotta click');
    $(this.get('target')).toggleClass('in');
  }
  
});