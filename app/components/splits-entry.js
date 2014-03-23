export default Ember.Component.extend({
    
  tagName: 'div',
  
  classNames: ['split-entry'],
  
  errorClass: function() {
    var error = this.get('error');
    return error ? 'split-entry-span error' : 'split-entry-span';
  }.property('error'),
  
  error: function() {
    var error = this.get('split.hasError');
    return error ? true : false;
  }.property('split.hasError'),
  
  mouseEnter: function() {
    this.sendAction('mouseHover', this.get('split'));
  }
  
});
