export default Ember.Route.extend({
  
  model: function() {
    return $.get('http://localhost:5984/olana/_design/olana-couch/_view/event-overview').then(function(data) { 
      var json = JSON.parse(data);
      return json.rows.map(function(row) { return row.value; });
    });
  },
  
  actions: {
    eventClicked: function(id) {
      this.transitionTo('event', id);
    }
  }

});
