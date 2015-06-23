Meteor.startup(function() {
  Tracker.autorun(function() {
    if(Session.get("sourceUrl")) {
      Meteor.subscribe("annotations", Session.get("sourceUrl"))
    }
  })

  Template.registerHelper("toISOString", function(date) { return date.toISOString() })
  Template.registerHelper("localISO", function(date) { return moment(date).format("YYYY-MM-DD HH:mm ZZ") })
  Template.registerHelper("calendar", function(date) { return moment(date).calendar() })
  Template.registerHelper("fromNow", function(date) { return moment(date).fromNow() })
  

  Template.sidebar.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    composeHl: function() {
      var composeHl = Session.get("composeHl")
      if(composeHl) {
        composeHl.compose = annotationPlaceholder
        return composeHl
      } else {
        return null
      }
    },
    highlights: function() {
      return Hls.find({},{sort: {createdAt: -1}})
    }
  })

  Template.highlight.helpers({
    hovered: function() {
      return Session.equals("hovered", this._id) // return true if hovered==hl_id
    },
    clicked: function() {
      return Session.equals("clicked", this._id)
    },
    author: function() {
      var user = Meteor.users.findOne(this.author)
      var profile = user.profile
      profile.picture = user.services.google.picture
      return profile
    },
    annotations: function() {
      return Annotes.find({inReplyTo: this._id})
    }
  })
})
