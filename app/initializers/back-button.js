export default {
  name: 'my-back-button',
  initialize: function(container, app) {
    app.inject('component:back-button', 'router', 'router:main');
    app.inject('component:back-button', 'applicationController', 'controller:application');
  }
};
