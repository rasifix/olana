import Runner from 'appkit/models/runner';
import Split from 'appkit/models/split';
import { parseTime, formatTime } from 'appkit/utils/time';

export default Ember.Route.extend({
  
  model: function(params) {
    var id = params['event_id'];
    return $.get('http://localhost:5984/olana/_design/olana-couch/_view/event-overview?key="' + id + '"').then(function(data) { 
      var json = JSON.parse(data);
      return json.rows[0].value;
    });
  },
  
  actions: {
    categoryClicked: function(name) {
      this.transitionTo('event.category', name);
    },
    legClicked: function(name) {
      this.transitionTo('event.leg', name);
    }
  }

});
