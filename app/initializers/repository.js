export default {
  name: 'repository',
  initialize: function(app) {
    app.inject('route', 'repository', 'service:repository');
  }
};
