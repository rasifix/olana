import EmberRouter from '@ember/routing/router';
import config from './config/environment';

var Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.resource('events', { path: '/' }, function() {
    this.route('new', { path: '/events/new' });
  });
  this.resource('event', { path: '/event/:source/:event_id'}, function() {
    this.route('starttime-analysis');
    this.route('error-analysis');
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
    this.resource('controls', function() {
      this.resource('control', { path: ':control_id' }, function() {
        
      });
    });
    this.resource('runners', function() { });
  });
});

export default Router;
