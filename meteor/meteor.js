Router.route('/url/:paperUrl', function () {
    this.render('paper', {data: this.params});
    var paperUrl = this.params.paperUrl
});


if (Meteor.isClient) {

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
