/* global $ */

import { run } from '@ember/runloop';
import Controller from '@ember/controller';
import config from '../../config/environment';
import { observer } from '@ember/object';

import { oware } from '@rasifix/orienteering-utils';
import { kraemer } from '@rasifix/orienteering-utils';

import log from 'olana/utils/log';

function reverse(s) {
  return s.split("").reverse().join("");
}

export default Controller.extend({
  title: 'Unknown Event',
  map: 'Unknown Map',
  date: '2014-09-09',
  startTime: '12:00',
  
  selectedEncoding: 'cp1252',
  encodings: null,

  init() {
    this._super(...arguments);
    this.encodings = [
      { value:"cp1252", label:"Windows-1252" },
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
      { value:"cp1253", label:"Windows-1253" },
      { value:"cp1254", label:"Windows-1254" },
      { value:"cp1255", label:"Windows-1255" },
      { value:"cp1256", label:"Windows-1256" },
      { value:"cp1257", label:"Windows-1257" },
      { value:"cp1258", label:"Windows-1258" },
      { value:"x-mac-roman", label:"Mac Roman" }
    ];
  },
  
  textObserver: observer('text', function() {
    var text = this.get('text');
    if (text && text.length > 8) {
      if (text.substring(0, 6) === 'OE0014' || text.substring(0, 23) === 'Stnr;Chip;Datenbank Id;') {
        this.set('event', kraemer.parse(text, { name: this.get('title'), map: this.get('map'), date: this.get('date'), startTime: this.get('startTime')}));
        
      } else if (text.substring(0, 8) === '//Format') {
        this.set('event', oware.parse(text));
      }
    } 
  }),
 
  generateId: function(event) {
    var now = new Date().getTime();
    return Math.abs(parseInt(reverse(now.toString())) ^ parseInt(reverse(event.date.replace(/-/g, '')))).toString(16);
  },
  
  actions: {
    fileChanged: function(e) {
      var reader = new FileReader();
      var that = this;        
      reader.onload = function(e) {
        var fileToUpload = e.target.result;
        run(function() { that.set('text', fileToUpload) });
      };
      reader.readAsText(e.target.files[0], this.get('encoding') || 'cp1252');  
    },

    submit: function() {
      const event = this.get('event');
      const id = this.generateId(event);
      const text = JSON.stringify(event);
      console.log(text);

      const that = this;

      $.ajax({
        type: 'PUT',
        url: config.APP.API_HOST + 'api/events/' + id,
        contentType: 'application/json; charset=UTF-8',
        data: text,
        beforeSend: function(xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("fluffy:stuffy"));
        },
        success: function() {
          that.transitionToRoute('event.index', 'local', id);
        },
        error: function(err) {
          // TODO: handle error
          log(err);
        }
      });
    }
  }
  
});
