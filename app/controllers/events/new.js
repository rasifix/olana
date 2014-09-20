/* global $, ENV */

import Ember from 'ember';
import { parseKraemer } from 'olana/utils/kraemer';
import { parseOWare } from 'olana/utils/oware';

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
  
  parsedContent: function() {
    var content = this.get('content');
    if (content && content.length > 8) {
      var lines = content.split(/\r?\n/);
      if (content.substring(0, 6) === 'OE0014') {
        return parseKraemer(lines, this.get('title'), this.get('map'), this.get('date'), this.get('startTime'));
        
      } else if (content.substring(0, 8) === '//Format') {
        var event = parseOWare(lines);
        this.set('title', event.name);
        this.set('map', event.map);
        this.set('date', event.date);
        this.set('startTime', event.startTime);
        return event;
      }
    } 
    return null;
  }.property('content'),
  
  submitDisabled: function() {
    console.log(this.get('parsedContent'));
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
      $.ajax({
        type: 'PUT',
        url: ENV.APP.API_HOST + 'api/events/' + id,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(content),
        success: function (data) {
          that.transitionToRoute('event.index', id);
        },
        error: function(err) {
          console.log('ERROR')
          console.log(err);
        }
      });
    }
  }
  
});
