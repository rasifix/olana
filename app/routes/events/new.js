import Route from '@ember/routing/route';

export default Route.extend({
  
  beforeModel: function() {
    if (!FileReader) {
      alert('Upload wird von deinem Browser nicht unterst&uuml;tzt. Bitte verwende eine aktuelle Version von Firefox, Chrome oder Safari.');
      this.transitionTo('/');
    }
  },
  
  model: function() {
    return [ ];
  }

});
