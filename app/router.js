var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('events', { path: '/' });
  this.resource('event', { path: '/event/:event_id'}, function() {
    this.resource('event.category', { path: 'category/:category_id' }, function() {
      this.route('runner', { path: 'runner/:runner_id' });
      this.route('h2h', { path: 'h2h/:runner_id' });
    });
    this.route('courses', { path: 'courses' });
    this.resource('event.course', { path: 'course/:route_id '}, function() {
      this.route('runner', { path: 'runner/:runner_id' });
      this.route('h2h', { path: 'h2h/:runner_id '});
    });
    this.resource('event.legs', { path: 'legs' }, function() {
      this.route('index', { path: '/' });
      this.route('leg', { path: ':leg_id' });      
    });
  });
  this.resource('runners', function() {
     this.route('runner', { path: ':runner_id'});
  });
});

export default Router;
