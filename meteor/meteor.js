Sxns= new Mongo.Collection('sxns') //selections

Router.route('/url/:paperUrl', function () {
  this.render('paper', {data: this.params});
  Session.set("paperUrl", this.params.paperUrl)
});


if (Meteor.isClient) {
  Session.setDefault("pdfCreator", null)
  var port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")
  port.onMessage.addListener(function (message) {
    if(message.pdfCreator) {
      Session.set("pdfCreator", message.pdfCreator)
    Tracker.autorun(function() {
      Sxns.find({paperUrl: Session.get("paperUrl")}).forEach(function(sxn) {
        port.postMessage({sxn_rects: sxn.selection.rects, id: sxn._id})
      })
    })
    } else if (message.selection) {
      Sxns.insert({paperUrl: Session.get("paperUrl"),
                   selection: message.selection})
    } else if (message.hover !== undefined) {
      if (message.hover) {
        Session.set("hovered", message.id) // sxn_id is the one thing set to hovered
      } else {
        Session.set("hovered", false)
      }
    }
  })


  // TEMPLATE HELPERS //

  Template.paper.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    selections: function() {
      return Sxns.find({paperUrl: Session.get("paperUrl")})
    }
  })

  Template.selection.helpers({
    hovered: function() {
      return Session.equals("hovered", this._id) // return true if hovered==sxn_id
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
