/* global $ */

import Ember from 'ember';
import config from '../config/environment';
import { parseTime, formatTime } from 'olana/utils/time';
import { parseRanking } from 'olana/utils/parser';
import { Rainbow } from 'olana/utils/rainbow';
import Runner from 'olana/models/runner';

function time(name) {
  if (typeof console !== 'undefined' && console.time) {
    console.time(name);
  }
}

function timeEnd(name) {
  if (typeof console !== 'undefined' && console.timeEnd) {
    console.timeEnd(name);
  }
}

export default Ember.Object.extend({
  
  cache: { },
  
  getEvents: function(year) {
    time('fetchEvents');
    var self = this;
    if (self.cache.events && self.cache.year == year) {
      timeEnd('fetchEvents from cache');
      return self.cache.events;
    }
    return $.get(config.APP.API_HOST + 'api/events?year=' + year).then(function(data) {
      timeEnd('fetchEvents');
      self.cache.year = year;
      self.cache.events = data.events;
      return self.cache.events;
    });
  },
  
  getEvent: function(source, id) {
    time('fetchEvent.' + id);
    
    if (this.cache.event && this.cache.event.id === id) {
      return this.cache.event;
    }
    
    var self = this;
    self.cache.event = { };
          
    return this.cache.event = {
        id: id,
        
        getCategories: function() {
          if (self.cache.event.categories) {
            return self.cache.event.categories;
          }
          return self.cache.event.categories = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/categories');
        },
        getCategory: function(categoryId) {
          return $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/categories/' + categoryId).then(function(category) {
            return {
              name: categoryId,
              runners: category.runners.map(function(runner) {
                return Runner.create(runner);
              })
            };
          });
        },
        getCourses: function() {
          if (self.cache.event.courses) {
            return self.cache.event.courses;
          }
          return self.cache.event.courses = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/courses');
        },
        getCourse: function(courseId) {
          return $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/courses/' + courseId).then(function(course) {
            return {
              runners: course.runners.map(function(runner) {
                return Runner.create(runner);
              })
            };
          });
        },
        getLegs: function() {
          if (self.cache.event.legs) {
            return self.cache.event.legs;
          }
          return self.cache.event.legs = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/legs');
        },
        getLeg: function(legId) {
          return $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/legs/' + legId);
        },
        getControls: function() {
          if (self.cache.event.controls) {
            return self.cache.event.controls;
          }
          return self.cache.event.controls = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/controls');
        },
        getControl: function(controlId) {
          return $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/controls/' + controlId);
        },
        getRunners: function() {
          if (self.cache.event.runners) {
            return self.cache.event.runners;
          }
          return self.cache.event.runners = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/runners');
        },
        
        getStartTime: function() {
          if (self.cache.event.starttime) {
            return self.cache.event.starttime;
          }
          return self.cache.event.starttime = $.get(config.APP.API_HOST + 'api/events/' + source + '/' + id + '/starttime');
        }
      };
  }
  
});