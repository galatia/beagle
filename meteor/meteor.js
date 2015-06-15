Router.route('/url/:paperUrl', function () {
  this.render('paper', {data: this.params});
  var paperUrl = this.params.paperUrl
});


if (Meteor.isClient) {
  Session.setDefault("pdfCreator", null)
  var port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")
  port.onMessage.addListener(function (message) {
    console.log(message);
    Session.set("pdfCreator", message.pdfCreator)
  })

  Template.paper.helpers({creator: function() {
    return Session.get("pdfCreator")
  }})
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
