import Ember from 'ember';

import { parseTime, formatTime } from 'olana/utils/time';

export default Ember.Route.extend({
  
  model: function(params) {    
    var legId = params['leg_id'];
    var from = legId.split('-')[0];
    var to = legId.split('-')[1];
        
    var leg = this.modelFor('legs').legs.find(function(leg) { return leg.id === legId; });
    return this.parseData(from, to, leg.runners);
  },
  
  parseData: function(from, to, ranking) {
    var fastest = parseTime(ranking[0].split);
    console.log(ranking.find(function(entry) { return entry.timeLoss; }));
    ranking.forEach(function(entry, idx) {
      if (idx > 0) {
        entry.splitBehind = '+' + formatTime(parseTime(entry.split) - fastest);
      }
    });
    
    // calculate the rank
    ranking.forEach(function(entry, idx) {
      if (idx === 0) {
        entry.splitRank = 1;
      } else {
        var prev = ranking[idx - 1];
        if (prev.split === entry.split) {
          entry.splitRank = prev.splitRank;
        } else {
          entry.splitRank = idx + 1;
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
