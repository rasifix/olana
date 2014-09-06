/* global $ */

import Ember from 'ember';
import { parseTime, formatTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  model: function(params) {
    var eventId = this.modelFor('event').id;
    var legId = params['leg_id'];
    var from = legId.split('-')[0];
    var to = legId.split('-')[1];
    var url = 'http://localhost:8080/api/event/' + eventId + '/leg/' + legId;
    var parseData = this.parseData;
    return $.get(url).then(function(data) { 
      return parseData(from, to, data.filter(function(e) { return e.split !== '-'; }));
    });
  },
  
  parseData: function(from, to, ranking) {
    var fastest = parseTime(ranking[0].split);
    ranking.forEach(function(entry, idx) {
      if (idx > 0) {
        entry.behind = '+' + formatTime(parseTime(entry.split) - fastest);
      }
    });
    
    // calculate the rank
    ranking.forEach(function(entry, idx) {
      if (idx === 0) {
        entry.rank = 1;
      } else {
        var prev = ranking[idx - 1];
        if (prev.split === entry.split) {
          entry.rank = prev.rank;
        } else {
          entry.rank = idx + 1;
        }
      }
    });
    
    return {
      from: from,
      to: to,
      name: from + '-' + to,
      data: ranking
    };
  }

});
