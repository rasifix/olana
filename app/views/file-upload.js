import Ember from 'ember';

export default Ember.TextField.extend({
  tagName: 'input',
  attributeBindings: [ 'name' ],
  type: 'file',
  text: null,
  encoding: 'cp1252',
  
  change: function (e) {
    var reader = new FileReader(), 
    that = this;        
    reader.onload = function(e) {
      var fileToUpload = e.target.result;
      Ember.run(function() {
        that.set('text', fileToUpload);
      });
    };
    reader.readAsText(e.target.files[0], this.get('encoding') || 'cp1252');
  }
});