import { parseTime, formatTime } from 'appkit/utils/time';

export default Ember.Route.extend({
  
  deserialize: function(params) {
    var eventId = this.modelFor('event').id;
    var legId = params['leg_id'];
    var from = legId.split('[-]')[0];
    var to = legId.split('[-]')[1];
    var url = 'http://localhost:5984/olana/_design/olana-couch/_view/leg-details?key=' + encodeURIComponent(JSON.stringify([eventId, legId]));
    var parseData = this.parseData;
    return $.get(url).then(function(data) { 
      var json = JSON.parse(data);
      return parseData(from, to, json.rows[0].value);
    });
  },
  
  parseData: function(from, to, ranking) {
    var fastest = parseTime(ranking[0].split);
    ranking.forEach(function(entry, idx) {
      if (idx > 0) {
        entry.behind = '+' + formatTime(parseTime(entry.split) - fastest);
      }
    });
    return {
      from: from,
      to: to,
      name: from + '-' + to,
      data: ranking
    };
  },
  
  model: function() {
    // totally irrelevant...
    return [];
  }

});
