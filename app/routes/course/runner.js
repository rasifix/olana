import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function(params) {
    var course = this.modelFor('course');    
    var runners = course.runners;
    var runner = runners.find(function(runner) { return runner.id === params['runner_id']; });
    
    if (!runner) {
      this.transitionTo('category');
    }

    return {
      id: runner.get('id'),
      fullName: runner.get('fullName'),
      time: runner.get('time'),
      errorTime: runner.get('errorTime'),
      splits: runner.splits.map(function(split) { 
        return {
          number: split.number,
          code: split.code,
          leg: split.leg,
          time: split.time,
          split: split.split,
          splitBehind: split.splitBehind,
          splitRank: split.splitRank,
          overallBehind: split.overallBehind,
          overallRank: split.overallRank,
          timeLoss: split.timeLoss,
          perfidx: split.perfidx
        };
      })
    };
  }
  
});
