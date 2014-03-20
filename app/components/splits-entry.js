export default Ember.Component.extend({
  
  classNameBindings: ['error'],
  
  tagName: 'tr',
  
  error: function() {
    return this.get('split.hasError');
  }.property('split.hasError'),
  
  mouseEnter: function() {
    this.sendAction('mouseHover', this.get('split'));
  }
  
});
