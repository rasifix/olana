import Ember from 'ember';

export default Ember.Component.extend({

  tagName: "span",

  router: null,
  applicationController: null,

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

  backRoute: function() {
    var controllers = this.get('controllers');

    for (var idx = controllers.length - 1; idx >= 0; idx--) {
      var backRoute = controllers[idx].get('backRoute');
      if (!Ember.isEmpty(backRoute)) {
        return backRoute;
      }
    }    
    return null;
  }.property('controllers.@each.backRoute')
  
});