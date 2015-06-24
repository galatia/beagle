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
        var range = window.getSelection().getRangeAt(0)
        var textContent = range.toString()
        console.log(textContent)
        var textNode = document.createTextNode(textContent)
        console.log(range)
        while ( range.startOffset    === 0                         &&
                range.endOffset      === range.endContainer.length &&
                range.startContainer === range.endContainer        &&
                range.endContainer.previousSibling === null        &&
                range.endContainer.nextSibling     === null        &&
               !range.endContainer.parentNode.getAttribute("contenteditable") ){
          range.selectNode(range.startContainer.parentNode)
          console.log(range)
        }

        range.deleteContents()
        range.insertNode(textNode)
      }
    },
    'click .toolbar button.createLink': function(e) {
      document.execCommand("createLink",false,prompt("Link address:",""))
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
