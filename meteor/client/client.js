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
    },
    'input [contenteditable]': function(e) {
      var hl = Session.get('composeHl')
      hl.annotation = e.target.innerHTML
      Session.set('composeHl', hl)
    },
    'focus [contenteditable]': function(e) {
      if(e.target.innerHTML == annotationPlaceholder) {
        e.target.innerHTML = ""
      }
    },
    'blur [contenteditable]': function(e) {
      if(e.target.innerHTML == "") {
        e.target.innerHTML = annotationPlaceholder
      }
    },
    'click .save': function() {
      var hl = Session.get('composeHl')
      var annote = {content: hl.annotation, inReplyTo: {
        sourceUrl:  hl.sourceUrl,
        rects:      hl.rects,
        sourceText: hl.sourceText
      }}
      Meteor.call("addAnnotation", annote, function(err, res) {
        if(res && res.hl && res.annote) {
          Session.set('composeHl', null)
        }
      })
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

  // When highlight is clicked, scrolls to it in sidebar
  Tracker.autorun(function() {
    if(Session.get("clicked")) {
      var elem = document.getElementById(Session.get("clicked"))
      document.body.scrollTop += elem.getBoundingClientRect().top
    }
  })
})
