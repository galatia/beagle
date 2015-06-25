Meteor.startup(function() {
  Session.setDefault("pdfCreator", null)


  Template.sidebar.events({
    'click .screenshot-taker': function() {
      port.postMessage({mode: 'screenshot'})
    },
    'click .sidebar': function() {
      Session.set("clicked", false)
    },
    'click .sortMenu .option': function(e) {
      sortOrder = e.target.getAttribute("data-sortOrder")
      if(sortOrder) {
        Session.set("sortOrder", sortOrder)
      }
    }
  })

  Template.highlight.events({
    'mouseenter .highlight': function() {
      Session.set("hovered", this._id)
    },
    'mouseleave .highlight': function() {
      Session.set("hovered", false)
    },
    'click .highlight': function(e) {
      Session.set("clicked", this._id)
      e.stopPropagation()
    },
    'input .sourceText': function(e) {
      Meteor.call("reviseSourceText", Template.currentData()._id, e.target.innerHTML)
    }
  })

  Template.singleAnnotation.events({
    'click .edit':  function(e) {
      Meteor.call("edit", this._id)
    },
    'click .reply': function(e) {
      console.log(this)
      Meteor.call("addDraftAnnotation", this._id)
    }
  })

  function scrollTo(id) {
    var elem   = document.getElementById(id)
    elem = elem.getElementsByClassName("sourceText")[0];
    if(!elem) return false;
    var rect   = elem.getBoundingClientRect()
    var top    = rect.top
    var bottom = rect.bottom
    var viewportHeight = document.documentElement.clientHeight

    var delta = (top/2 + bottom/2) - viewportHeight/2

    var begin = document.body.scrollTop
    var t0 = null;
    var thalf = Math.max(110, Math.min(50, delta/10));
    var step = function(ts) {
      if(!t0) t0 = ts;
      var t = (ts - t0) / thalf;
      if (t < 2) {
        if (t < 1) {
          document.body.scrollTop = begin - delta/2 * (Math.sqrt(1 - t*t) - 1);
        } else {
          t -= 2;
          document.body.scrollTop = begin + delta/2 * (Math.sqrt(1 - t*t) + 1);
        }
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  // When highlight is clicked, scrolls to it in sidebar
  Tracker.autorun(function() {
    if(Session.get("clicked")) {
      Session.get("sortOrder")
      Annotes.find()
      setTimeout(function() {
        scrollTo(Session.get("clicked"))
      },75)
    }
  })
})
