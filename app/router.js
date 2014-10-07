import Ember from 'ember';

var Router = Ember.Router.extend({
  location: AppKitENV.locationType
});

Router.map(function() {
  this.resource('events', { path: '/' }, function() {
    this.route('new', { path: '/events/new' });
  });
  this.route('runner', { path: '/runners/:id' });
  this.resource('event', { path: '/event/:event_id'}, function() {
    this.route('starttime-analysis');
    this.resource('categories', function() {
      this.resource('category', { path: ':category_id' }, function() {
        this.route('runner', { path: 'runner/:runner_id' });
        this.route('h2h', { path: 'h2h/:runner_id' });
      });     
    });
    this.resource('courses', function() {
      this.resource('course', { path: ':course_id'}, function() {
        this.route('runner', { path: 'runner/:runner_id' });
        this.route('h2h', { path: 'h2h/:runner_id'});
      });
    });
    this.resource('legs', function() {
      this.resource('leg', { path: ':leg_id' }, function() {

      });     
    });
  });
});

export default Router;
