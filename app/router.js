var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('events', { path: '/' });
  this.resource('event', { path: '/event/:event_id'}, function() {
    this.route('categories', { path: 'categories' });
    this.resource('event.category', { path: 'categories/:category_id' }, function() {
      this.route('runner', { path: 'runner/:runner_id' });
      this.route('h2h', { path: 'h2h/:runner_id' });
    });
    this.route('courses', { path: 'courses' });
    this.resource('event.course', { path: 'courses/:course_id '}, function() {
      this.route('runner', { path: 'runner/:runner_id' });
      this.route('h2h', { path: 'h2h/:runner_id '});
    });
    this.route('legs', { path: 'legs' });
    this.resource('event.leg', { path: 'legs/:leg_id' }, function() {
      
    });
  });
  this.resource('runners', function() {
     this.route('runner', { path: ':runner_id'});
  });
});

export default Router;
