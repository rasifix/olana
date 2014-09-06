import Ember from 'ember';

export default Ember.Component.extend({

  tagName: "ul",
  classNames: ["breadcrumbs"],

  router: null,
  applicationController: null,
  
  layout: Ember.Handlebars.compile('{{title}}'),

  handlerInfos: function() {
    return this.get('router').router.currentHandlerInfos;
  }.property('applicationController.currentPath'),

  pathNames: function() {
    return this.get('handlerInfos').map(function(handlerInfo) {
      return handlerInfo.name;
    });
  }.property('handlerInfos.[]'),

  controllers: function() {
    return this.get('handlerInfos').map(function(handlerInfo) {
      return handlerInfo.handler.controller;
    });
  }.property('handlerInfos.[]'),

  title: function() {
    var controllers = this.get('controllers');
    var defaultPaths = this.get('pathNames');

    for (var idx = controllers.length - 1; idx >= 0; idx--) {
      var title = controllers[idx].get('name');
      if (!Ember.isEmpty(title)) {
        return title;
      }
    }    
    
    return 'Undefined';
  }.property('controllers.@each.name')
  
});