import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    event.legs.sort(function(l1, l2) {
      var sp1 = l1.id.split('-');
      var sp2 = l2.id.split('-');
      if (sp1[0] === 'St' && sp2[0] !== 'St') {
        return -1;
      } else if (sp1[0] !== 'St' && sp2[0] === 'St') {
        return 1;
      } else if (sp1[1] === 'Zi' && sp2[1] !== 'Zi') {
        return 1;
      } else if (sp1[1] !== 'Zi' && sp2[1] === 'Zi') {
        return -1;
      } else if (sp1[0] === sp2[0] && sp1[1] === sp2[1]) {
        return 0;
      } else {
        var d = parseInt(sp1[0]) - parseInt(sp2[0]);
        if (d !== 0) {
          return d;
        }
        d = parseInt(sp1[1]) - parseInt(sp2[1]);
        return d;
      }
    });
    return {
      legs: event.legs
    };
  },
  
  actions: {
    legClicked: function(name) {
      this.transitionTo('leg', name);
    }
  }

});
