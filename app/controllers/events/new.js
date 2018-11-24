/* global $ */

import Controller from '@ember/controller';
import config from '../../config/environment';
import { computed } from '@ember/object';

import { parseKraemer } from 'olana/utils/kraemer';
import { parseOWare } from 'olana/utils/oware';
import { formatTime, parseTime } from 'olana/utils/time';
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
    ];
  },
  
  cleanContent: computed('parsedContent', function() {
    var parsed = this.get('parsedContent');
    if (!parsed) {
      return '';
    }
    return JSON.stringify(parsed, null, '  ');
  }),
  
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
  
  parsedContent: computed('text', function() {
    var text = this.get('text');
    if (text && text.length > 8) {
      var lines = text.trim().split(/\r?\n/);
      if (text.substring(0, 6) === 'OE0014' || text.substring(0, 23) === 'Stnr;Chip;Datenbank Id;') {
        return parseKraemer(lines, this.get('title'), this.get('map'), this.get('date'), this.get('startTime'));
        
      } else if (text.substring(0, 8) === '//Format') {
        var event = parseOWare(lines);
        // FIXME: eliminate side effect
        /*this.set('title', event.name);
        this.set('map', event.map);
        this.set('date', event.date);
        this.set('startTime', event.startTime);*/
        return event;
      }
    } 
    return null;
  }),

  uploadContent: computed('parsedContent',function() {
    var event = this.get('parsedContent');

    //Format: Rank;Name;Firstname;YearOfBirth;SexMF;FedNr;Zip;Town;Club;NationIOF;StartNr;eCardNr;RunTime;StartTime;FinishTime;CtrlCode;SplitTime; ...
    //Bern By Night 2018/ 2019 - Contest #1;Scherligraben 1:10'000;2018-11-16;18:00;Marcel Schiess
    var result = 'Format: Rank;Name;Firstname;YearOfBirth;SexMF;FedNr;Zip;Town;Club;NationIOF;StartNr;eCardNr;RunTime;StartTime;FinishTime;CtrlCode;SplitTime; ...\n';
    result += event.get('name') + ';' + event.get('map') + ';' + event.get('date') + ';' + event.get('startTime') + ';\n';

    event.categories.forEach(category => {
      //K;4100;170;16
      result += category.name + ';' + category.distance + ';' + category.ascent + ';' + category.controls + ';\n';
      //1;Wenger;Simon;1994;M;??????;3098;Schliern b. Köniz;OLG Bern / ol norska;SUI;259;8151194;30:52;60:00;90:52;48;7:04;47;7:55;34;9:37;48;10:40;36;11:16;35;11:53;48;12:40;40;13:56;41;15:57;45;21:54;44;22:42;42;23:29;31;24:54;32;25:59;45;27:16;42;28:34;43;30:28
//      let idx = 0;
      let rank = 1;
      category.runners.forEach(runner => {
        // FIXME: rank
        result += rank + ';' + runner.lastName + ';' + runner.firstName + ';' + runner.yearOfBirth + ';' + runner.sex + ';';
        result += ';'; // SOLV Nr
        result += runner.zip + ';' + runner.city + ';' + runner.club + ';' + runner.nation + ';';
        result += runner.startNumber + ';' + runner.ecard + ';';
        result += runner.time + ';' + runner.startTime + ';';
        result += ';'; // Finish Time = time - startime
        runner.splits.forEach(split => {
          result += split[0] + ';' + split[1]; // FIXME: internal format shall be expressive, not terse
        });
        result += '\n';

//        idx += 1;
      });
    });

    return result;
  }),
  
  categories: computed('parsedContent', function() {
    var parsed = this.get('parsedContent');
    return parsed ? parsed.categories : [];
  }),
   
  submitDisabled: computed('parsedContent', function() {
    return this.get('parsedContent') === null;
  }),
  
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
          // TODO: handle error
          log(err);
        }
      });
    }
  }
  
});
