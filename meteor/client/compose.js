Meteor.startup(function() {
  annotationPlaceholder = '<span class="annotation-placeholder"></span>'
  Template.composeBox.events({
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
    'click .toolbar button': function(e) {
      var cF = document.getElementById("composeField")
      cF.focus()
      var cmd = e.currentTarget.getAttribute('data-command')
      console.log("cmd", cmd)
      document.execCommand(cmd)
      if(cmd=="removeFormat") {
        cF.innerHTML = cF.innerText.replace(/\n/g,"<br/>")
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
          Session.set('clicked', res.hl)
        }
      })
    },
    'click .discard': function() {
      Session.set('composeHl', null)
      if(Session.equals('clicked', 'composeHl')) {Session.set('clicked', false)}
      if(Session.equals('hover'  , 'composeHl')) {Session.set('hover'  , false)}
    }
  })
})
