port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")

port.onMessage.addListener(function (message) {
  if(message.pdfCreator) {
    Session.set("pdfCreator", message.pdfCreator)
    Tracker.autorun(function() {
      Hls.find({paperUrl: Session.get("paperUrl")}).observeChanges({
        added: function(id, fields) {
                 fields._id=id
                 port.postMessage({hl_added: fields})
               },
        changed: function(id, fields) {
                   port.postMessage({hl_changed: {id: id, fields: fields}})
                 },
        removed: function(id) {
                   port.postMessage({hl_removed: {id: id}})
                 }
      })
    })
  } else if (message.highlight) {
    message.highlight.paperUrl = Session.get("paperUrl")
    message.highlight.compose = true
    Hls.insert(message.highlight)
  } else if (message.hover !== undefined) {
    if (message.hover) {
      Session.set("hovered", message._id) // hl_id is the one thing set to hovered
    } else {
      Session.set("hovered", false)
    }
  } else if (message.clicked !== undefined) {
    if(message.clicked) {
      Session.set("clicked", message._id)
    } else {
      Session.set("clicked", false)
    }
  }
})
