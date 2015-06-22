Hls     = new Mongo.Collection('hls')     //highlights
Annotes = new Mongo.Collection('annotes') //annotations
annotationPlaceholder = '<span class="annotation-placeholder"></span>'

Router.route('/url/:sourceUrl', function () {
  this.render('sidebar', {data: this.params});
  Session.set('sourceUrl', this.params.sourceUrl)
});
