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

  Session.setDefault("sortOrder", "contentOrder")
  function sortOrder() {
    if (Session.equals("sortOrder", "recentItems")) {
      return {draft: -1, publishedAt: -1}
    } else if (Session.equals("sortOrder", "recentActivity")) {
      return {draft: -1, activityAt: -1}
    } else {
      return {"contentOrder.page": 1, "contentOrder.y": -1, "contentOrder.x": 1}
    }
  }

  Template.sidebar.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    highlights: function() {
      return Hls.find({},{sort: sortOrder()})
    },
    linkPreview: function() {
      return Session.get("linkPreview")
    },
    linkEdit: function() {
      return Session.get("linkEdit")
    }
  })

  Template.highlight.helpers({
    hovered: function() {
      return Session.equals("hovered", this._id) // return true if hovered==hl_id
    },
    clicked: function() {
      return Session.equals("clicked", this._id)
    },
  })

  Template.registerHelper("annotations", function() {
    return Annotes.find({inReplyTo: this._id}, {sort: sortOrder()}).fetch()
  })

  Template.annotation.helpers({
    compose: function() {
      return this.draft || this.editing
    }
  })

  Template.singleAnnotation.helpers({
    author: function() {
      var user = Meteor.users.findOne(this.author)
      var profile = user.profile
      profile.picture = user.services.google.picture
      return profile
    },
    owner: function() {
      return Meteor.userId() == this.author
    }
  })
})
