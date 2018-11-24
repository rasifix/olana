import Route from '@ember/routing/route';
import { Rainbow } from 'olana/utils/rainbow';

export default Route.extend({
  
  model: function(params) {
    var code = params['control_id'];
    return this.modelFor('event').getControl(code).then(function(control) {
      var colors = new Rainbow();
      colors.setSpectrum('green', 'yellow', 'orange', 'red');
      control.from.forEach(function(from) {      
        from.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(from.errorFrequency) + '; color:white; text-align:right; width:' + from.errorFrequency + '%';
        from.style = from.style.htmlSafe();
      });
      control.to.forEach(function(to) {      
        to.style = 'display:inline-block; margin-right:5px; background-color:#' + colors.colourAt(to.errorFrequency) + '; color:white; text-align:right; width:' + to.errorFrequency + '%';
        to.style = to.style.htmlSafe();
      });
      return control;
    });
  }

});