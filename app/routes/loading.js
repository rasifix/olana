/* global Pace */

import Route from '@ember/routing/route';

export default Route.extend({
  activate: function() {
    this._super();
    return Pace.restart();
  },
  deactivate: function() {
    this._super();
    return Pace.stop();
  }
});

