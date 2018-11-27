export default {
  name: 'my-page-title',
  initialize: function(app) {
    app.inject('component:page-title', 'router', 'router:main');
    app.inject('component:page-title', 'applicationController', 'controller:application');
  }
};
