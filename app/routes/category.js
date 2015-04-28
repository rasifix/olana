import Ember from 'ember';

import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
  
  model: function(params) {
    var event = this.modelFor('event');
    var id = params['category_id'];
    var category = event.categories.find(function(category) {
      if (category.name === id) {
        return category;
      }
    });
    if (!category) {
      this.transitionTo('categories');
      return;
    }
    return parseRanking(category);
  },
  
  actions: {
    onlegclick: function(leg) {
      // FIXME: leg.leg is undefined (only leg.code exists which is a control)
      this.transitionTo('leg', leg.leg);
    }
  }

});