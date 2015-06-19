Meteor.startup(function() {
  Session.setDefault("pdfCreator", null)

  Template.highlight.events({
    'mouseenter .highlight': function() {
      Session.set("hovered", this._id)
      port.postMessage({hover: true, hl_id: this._id})
    },
    'mouseleave .highlight': function() {
      Session.set("hovered", false)
      port.postMessage({hover: false, hl_id: this._id})
    },
    'click .highlight': function() {
      Session.set("clicked", this._id)
      port.postMessage({clicked: true, hl_id: this._id})
    }
  })

  // When highlight is clicked, scrolls to it in sidebar
  Tracker.autorun(function() {
    if(Session.get("clicked")) {
      var elem = document.getElementById(Session.get("clicked"))
      document.body.scrollTop += elem.getBoundingClientRect().top
    }
  })
})
