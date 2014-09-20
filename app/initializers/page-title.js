import Ember from 'ember';
import PageTitleComponent from 'olana/components/page-title';

export default {
  name: 'my-page-title',
  initialize: function(container, app) {
    window.app = app;
    app.inject('component:page-title', 'router', 'router:main');
    app.inject('component:page-title', 'applicationController', 'controller:application');
  }
};
