var RunnersRunnerRoute = Ember.Route.extend({
  deserialize: function(params) {
    var id = params.runner_id;
    console.log("DESERIALIZE Runner " + id);
    var parentModel = this.modelFor("runners");
    var runner = parentModel.runners[id];
    return runner;
  },
  serialize: function(runner) {
    return { runner_id: runner.id };
  },
  model: function() {
    console.log("ERRRRRRRRROOOORRRR");
    return { };
  },
  afterModel: function(runner) {
    var runners = this.modelFor("runners");
    Ember.set(runners, 'activeRunner', runner);
  }
  
});

export default RunnersRunnerRoute;