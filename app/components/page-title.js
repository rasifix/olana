import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({

  tagName: "span",

  router: null,
  applicationController: null,

  handlerInfos: computed('applicationController.currentPath', () => this.get('router').router.currentHandlerInfos),

  pathNames: computed('handlerInfos.[]', () => this.get('handlerInfos').map(handlerInfo => handlerInfo.name)),

  controllers: computed('handlerInfos.[]', () => this.get('handlerInfos').map(handlerInfo => handlerInfo.handler.controller)),

  title: computed('controllers.@each.name', function() {
    var controllers = this.get('controllers');

    for (var idx = controllers.length - 1; idx >= 0; idx--) {
      var title = controllers[idx].get('name');
      if (!isEmpty(title)) {
        return title;
      }
    }    
    
    return 'Undefined';
  })
  
});