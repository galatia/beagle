Sxns= new Mongo.Collection('sxns') //selections

Router.route('/url/:paperUrl', function () {
  this.render('paper', {data: this.params});
  Session.set("paperUrl", this.params.paperUrl)
});


if (Meteor.isClient) {
  Session.setDefault("pdfCreator", null)
  var port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")
  port.onMessage.addListener(function (message) {
    console.log(message);
    if(message.pdfCreator) {
      Session.set("pdfCreator", message.pdfCreator)
    } else if (message.selection) {
      Sxns.insert({paperUrl: Session.get("paperUrl"),
                   selection: message.selection})
    }
  })

  Template.paper.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    selections: function() {
      return Sxns.find({paperUrl: Session.get("paperUrl")})
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
