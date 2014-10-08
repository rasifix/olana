/* global $ */

import Ember from 'ember';

var order = [ 'HE', 
              'HAL', 'HAM', 'HAK', 'HB', 
              'H35', 'H40', 'H45', 'H50', 'H55', 'H60', 'H65', 'H70', 'H75', 'H80',
              'H20', 'H18', 'H16', 'H14', 'H12', 'H10', 
              'DE', 
              'DAL', 'DAM', 'DAK', 'DB', 
              'D35', 'D40', 'D45', 'D50', 'D55', 'D60', 'D65', 'D70', 'D75', 'D80',
              'D20', 'D18', 'D16', 'D14', 'D12', 'D10',
              'OL', 'OM', 'OK'
            ];

export default Ember.Route.extend({
  
  model: function(params) {
    var id = params['event_id'];
    return $.get(ENV.APP.API_HOST + 'api/events/' + id).then(function(data) {
      data.categories = data.categories.sort(function(c1, c2) {
        var idx1 = order.indexOf(c1.name);
        var idx2 = order.indexOf(c2.name);
        
        if (idx1 === -1 && idx2 === -1) {
          return 0;
        } else if (idx1 === -1) {
          return 1;
        } else if (idx2 === -1) {
          return -1;
        } else {
          return idx1 - idx2;
        }
      });
      return data;
    });
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('category', name);
    },
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
