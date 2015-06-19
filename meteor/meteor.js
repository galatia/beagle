Hls = new Mongo.Collection('hls') //highlights

Router.route('/url/:paperUrl', function () {
  this.render('sidebar', {data: this.params});
  Session.set('paperUrl', this.params.paperUrl)
});
