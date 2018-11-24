import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({

  tagName: "span",

  router: null,
  applicationController: null,

  handlerInfos: computed('applicationController.currentPath', () => this.get('router').router.currentHandlerInfos),

  pathNames: computed('handlerInfos.[]', () => this.get('handlerInfos').map((handlerInfo) => handlerInfo.name)),

  controllers: computed('handlerInfos.[]', () => this.get('handlerInfos').map((handlerInfo) => handlerInfo.handler.controller)),

  backRoute: computed('controllers.@each.backRoute', function() {
    var controllers = this.get('controllers');

    for (var idx = controllers.length - 1; idx >= 0; idx--) {
      var backRoute = controllers[idx].get('backRoute');
      if (!isEmpty(backRoute)) {
        return backRoute;
      }
    }    
    return null;
  })
  
});