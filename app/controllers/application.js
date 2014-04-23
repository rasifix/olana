export default Ember.Controller.extend({

  breadcrumbs: [],

  watchCurrentPath: function () {
    this.send('setCrumbs');
  }.observes('currentPath'),

  actions: {
    currentPathDidChange: function () {
      this.send('setCrumbs');
    },
    setCrumbs: function() {

      // BEWARE:
      // This is some super hacky, non-public API shit right here

      var crumbs = [];

      // Clear out the current crumbs
      this.get('breadcrumbs').clear();

      // Get all the route objects
      var routes = this.container.lookup('router:main')
        .get('router.currentHandlerInfos');

      crumbs.pushObject(Ember.Object.create({
        route: 'events',
        name: 'Home',
        model: null
      }));
      
      // Get the route name, and model if it has one
      routes.forEach(function(route, i, arr) {

        // Ignore index routes etc.
        var name = route.name;
        
        if (name.indexOf('.index') !== -1 || name === 'application' || name === 'events') {
          return;
        }

        var crumb = Ember.Object.create({
          route: route.handler.routeName,
          name: route.handler.routeName,
          model: null
        });

        // If it's dynamic, you need to push in the model so we can pull out an ID in the link-to
        if (name === 'event.category.h2h') {
          crumb.set('name', 'Direktvergleich');
        } else if (name === 'event.category.runner') {
          crumb.set('name', route.handler.context.get('fullName'));
        } else if (route.handler.context.name) {
          crumb.setProperties({
            model: route.handler.context,
            name: route.handler.context.name
          });
        }

        // Now push it to the crumbs array
        crumbs.pushObject(crumb);
      });
      
      if (crumbs.length === 1) {
        crumbs = [];
      }

      this.set('breadcrumbs', crumbs);

      // Set the last item in the breadcrumb to be active
      this.get('breadcrumbs.lastObject').set('active', true);

    }
  }
});