import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
    var event = this.modelFor('event');
    var arrayOfArray = event.categories.map(function(category) {
      return category.runners.map(function(runner) {
        return {
          id: runner.id,
          fullName: runner.fullName,
          club: runner.club,
          city: runner.city,
          yearOfBirth: runner.yearOfBirth,
          category: category.name
        };
      });
    });
    var runners = [];
    runners = runners.concat.apply(runners, arrayOfArray).sort(function(r1, r2) {
      return r1.fullName.localeCompare(r2.fullName);
    });
    return {
      runners: runners
    };
  }

});
