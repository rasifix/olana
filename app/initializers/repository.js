export default {
  name: 'repository',
  initialize: function(container, app) {
    app.inject('route', 'repository', 'service:repository');
  }
};
