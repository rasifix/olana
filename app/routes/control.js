import Ember from 'ember';
import { parseRanking } from 'olana/utils/parser';

export default Ember.Route.extend({
  
  model: function(params) {
    var controls = this.modelFor('controls').controls;
    var code = params['control_id'];
    var control = controls.find(function(control) { return control.code === code; });
    if (typeof control === 'undefined') {
      this.transitionTo('controls');
    }
    return control;
  }

});