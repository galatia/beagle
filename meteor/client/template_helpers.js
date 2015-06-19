Meteor.startup(function() {
  Template.sidebar.helpers({
    creator: function() {
      return Session.get("pdfCreator")
    },
    highlights: function() {
      return Hls.find({paperUrl: Session.get("paperUrl")})
    }
  })

  Template.highlight.helpers({
    hovered: function() {
      return Session.equals("hovered", this._id) // return true if hovered==hl_id
    },
    clicked: function() {
      return Session.equals("clicked", this._id)
    }
  })
})
