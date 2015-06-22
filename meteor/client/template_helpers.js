Meteor.startup(function() {
  Tracker.autorun(function() {
    if(Session.get("sourceUrl")) {
      Meteor.subscribe("annotations", Session.get("sourceUrl"))
    }
  })
  Template.sidebar.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    composeHl: function() {
      return Session.get("composeHl")
    },
    annotationPlaceholder: function() {
      return annotationPlaceholder
    },
    highlights: function() {
      return Hls.find()
    }
  })

  Template.highlight.helpers({
    hovered: function() {
      return Session.equals("hovered", this._id) // return true if hovered==hl_id
    },
    clicked: function() {
      return Session.equals("clicked", this._id)
    },
    annotations: function() {
      return Annotes.find({inReplyTo: this._id})
    }
  })
})
