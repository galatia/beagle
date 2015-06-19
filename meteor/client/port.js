port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")

port.onMessage.addListener(function (message) {
  if(message.pdfCreator) {
    Session.set("pdfCreator", message.pdfCreator)
    Tracker.autorun(function() {
      Hls.find({paperUrl: Session.get("paperUrl")}).forEach(function(hl) {
        port.postMessage({hl_rects: hl.highlight.rects, id: hl._id})
      })
    })
  } else if (message.highlight) {
    Hls.insert({paperUrl: Session.get("paperUrl"),
                 highlight: message.highlight})
  } else if (message.hover !== undefined) {
    if (message.hover) {
      Session.set("hovered", message.id) // hl_id is the one thing set to hovered
    } else {
      Session.set("hovered", false)
    }
  } else if (message.clicked !== undefined) {
    Session.set("clicked", message.id)
  }
})
