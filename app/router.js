import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
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
