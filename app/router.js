import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('events', { path: '/' }, function() {
    this.route('new', { path: '/events/new' });
  });
  this.route('event', { path: '/event/:source/:event_id'}, function() {
    this.route('starttime-analysis');
    this.route('error-analysis');
    this.route('categories', function() {
      this.route('category', { path: ':category_id' }, function() {
        this.route('runner', { path: 'runner/:runner_id' });
        this.route('h2h', { path: 'h2h/:runner_id' });
      });     
    });
    this.route('courses', function() {
      this.route('course', { path: ':course_id'}, function() {
        this.route('runner', { path: 'runner/:runner_id' });
        this.route('h2h', { path: 'h2h/:runner_id'});
      });
    });
    this.route('legs', function() {
      this.route('leg', { path: ':leg_id' }, function() {

      });     
    });
    this.route('controls', function() {
      this.route('control', { path: ':control_id' }, function() {
        
      });
    });
    this.route('runners', function() { });
  });
});

export default Router;
