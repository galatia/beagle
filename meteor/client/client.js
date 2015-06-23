Meteor.startup(function() {
  Session.setDefault("pdfCreator", null)

  var unclickCurrent = function() {
    if(Session.get('clicked')) {
      port.postMessage({clicked: false, hl_id: Session.get("clicked")})
    }
  }

  Template.sidebar.events({
    'click .screenshot-taker': function() {
      port.postMessage({mode: 'screenshot'})
    },
    'click .sidebar': function() {
      unclickCurrent()
      Session.set("clicked", false)
    }
  })

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
      unclickCurrent()
      Session.set("clicked", this._id)
      port.postMessage({clicked: true, hl_id: this._id})
      return false
    }
  })

  function scrollTo(id) {
    var elem = document.getElementById(id)
    document.body.scrollTop += elem.getBoundingClientRect().top
  }

  // When highlight is clicked, scrolls to it in sidebar
  Tracker.autorun(function() {
    if(Session.get("clicked")) {
      Hls.findOne(Session.get("clicked"))
      scrollTo(Session.get("clicked"))
    }
  })
})
