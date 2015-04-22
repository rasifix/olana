/* global $ */

import Ember from 'ember';
import config from '../../config/environment';

import { parseKraemer } from 'olana/utils/kraemer';
import { parseOWare } from 'olana/utils/oware';
import { formatTime, parseTime } from 'olana/utils/time';

function reverse(s) {
  return s.split("").reverse().join("");
}

export default Ember.ObjectController.extend({
  title: 'Unknown Event',
  map: 'Unknown Map',
  date: '2014-09-09',
  startTime: '12:00',
  
  selectedEncoding: 'cp1252',
  encodings: [
    { value:"utf8", label:"UTF-8" },
    { value:"iso-8859-1", label:"ISO-8859-1" },
    { value:"iso-8859-2", label:"ISO-8859-2" },
    { value:"iso-8859-3", label:"ISO-8859-3" },
    { value:"iso-8859-4", label:"ISO-8859-4" },
    { value:"iso-8859-5", label:"ISO-8859-5" },
    { value:"iso-8859-6", label:"ISO-8859-6" },
    { value:"iso-8859-7", label:"ISO-8859-7" },
    { value:"iso-8859-8", label:"ISO-8859-8" },
    { value:"iso-8859-9", label:"ISO-8859-9" },
    { value:"iso-8859-10", label:"ISO-8859-10" },
    { value:"iso-8859-11", label:"ISO-8859-11" },
    { value:"iso-8859-12", label:"ISO-8859-12" },
    { value:"iso-8859-13", label:"ISO-8859-13" },
    { value:"iso-8859-14", label:"ISO-8859-14" },
    { value:"iso-8859-15", label:"ISO-8859-15" },
    { value:"iso-8859-16", label:"ISO-8859-16" },
    { value:"cp1250", label:"Windows-1250" },
    { value:"cp1251", label:"Windows-1251" },
    { value:"cp1252", label:"Windows-1252" },
    { value:"cp1253", label:"Windows-1253" },
    { value:"cp1254", label:"Windows-1254" },
    { value:"cp1255", label:"Windows-1255" },
    { value:"cp1256", label:"Windows-1256" },
    { value:"cp1257", label:"Windows-1257" },
    { value:"cp1258", label:"Windows-1258" },
    { value:"x-mac-roman", label:"Mac Roman" }
  ],
  
  cleanContent: function() {
    var parsed = this.get('parsedContent');
    if (!parsed) {
      return '';
    }
    return JSON.stringify(parsed, null, '  ');
  }.property('parsedContent'),
  
  reorganize: function(event) {
    this.set('reorganized', false);
    var that = this;
    event.categories.filter(function(category) { return category.runners.length > 0; }).forEach(function(category) {
      var course = category.runners[0].course;
      var controls = course.split(',');
      category.runners.slice(1).forEach(function(runner) {
        if (runner.course !== course && parseTime(runner.time) !== null) {
          that.set('reorganized', true);
          var splits = runner.splits;
          
          if (controls[0] !== splits[0][0]) {
            console.log('invalid');
            return;
          }
          
          var nsplits = [ ];
          
          controls.forEach(function(control, idx) {
            var leg = idx === 0 ? null : controls[idx - 1] + '-' + control;
            
            var nsplit = splits.find(function(split, splitIdx) {
              if (splitIdx > 0) {
                return splits[splitIdx - 1][0] + '-' + split[0] === leg;
              } else if (idx === 0) {
                return true;
              }
            });
            
            if (!nsplit) {
              console.log('invalid split');
              return;
            }
            
            var currentIdx = splits.indexOf(nsplit);
            if (currentIdx === 0) {
              nsplits.push(nsplit);
            } else {
              var prev = splits[currentIdx - 1];
              var time = nsplits[idx - 1][1];
              nsplits.push([nsplit[0], formatTime(parseTime(time) + parseTime(nsplit[1]) - parseTime(prev[1]))]);
            }            
          });
          
          runner.splits = nsplits;
        }
      });
    });
    return event;
  },
  
  parsedContent: function() {
    var text = this.get('text');
    if (text && text.length > 8) {
      var lines = text.trim().split(/\r?\n/);
      if (text.substring(0, 6) === 'OE0014' || text.substring(0, 23) === 'Stnr;Chip;Datenbank Id;') {
        return parseKraemer(lines, this.get('title'), this.get('map'), this.get('date'), this.get('startTime'));
        
      } else if (text.substring(0, 8) === '//Format') {
        var event = this.reorganize(parseOWare(lines));
        this.set('title', event.name);
        this.set('map', event.map);
        this.set('date', event.date);
        this.set('startTime', event.startTime);
        return event;
      }
    } 
    return null;
  }.property('text'),
  
  categories: function() {
    var parsed = this.get('parsedContent');
    return parsed ? parsed.categories : [];
  }.property('parsedContent'),
   
  submitDisabled: function() {
    return this.get('parsedContent') === null;
  }.property('parsedContent'),
  
  generateId: function(event) {
    var now = new Date().getTime();
    return Math.abs(parseInt(reverse(now.toString())) ^ parseInt(reverse(event.date.replace(/-/g, '')))).toString(16);
  },
  
  actions: {
    submit: function() {
      var content = this.get('parsedContent');
      var id = this.generateId(content);
      var that = this;
      
      content.name = this.get('title');
      content.map = this.get('map');
      content.date = this.get('date');
      content.startTime = this.get('startTime');
      
      $.ajax({
        type: 'PUT',
        url: config.APP.API_HOST + 'api/events/' + id,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(content),
        success: function() {
          that.transitionToRoute('event.index', 'zimaa', id);
        },
        error: function(err) {
          console.log('ERROR');
          console.log(err);
        }
      });
    }
  }
  
});
