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
    },
    'click .save': function() {
      var comment = Template.instance().find('textarea.comment').value
      console.log(comment)
      Hls.update(this._id, {$set: {compose: false, comment: comment}})
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
