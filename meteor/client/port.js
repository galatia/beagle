port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")

port.onMessage.addListener(function (message) {
  if(message.pdfCreator) {
    Session.set("pdfCreator", message.pdfCreator)
    Hls.find().observeChanges({
      added: function(id, fields) {
               fields._id=id
               port.postMessage({hl_added: fields})
               if(Session.get("hover") == id) {
                 port.postMessage({hl_id: id, hover: true})
               }
               if(Session.get("clicked") == id) {
                 port.postMessage({hl_id: id, clicked: true})
               }
             },
      changed: function(id, fields) {
                 port.postMessage({hl_changed: {id: id, fields: fields}})
               },
      removed: function(id) {
                 port.postMessage({hl_removed: {id: id}})
               }
    })
    var oldComposeHl = undefined
    Tracker.autorun(function() {
      var composeHl = Session.get("composeHl")
      console.log(oldComposeHl, composeHl)
      if(composeHl) {
        if(oldComposeHl) {
          port.postMessage({hl_changed: {id: composeHl._id, fields: composeHl}})
        } else {
          port.postMessage({hl_added: composeHl})
        }
        port.postMessage({hl_id: composeHl._id, clicked: true})
      } else {
        if(oldComposeHl) {
          port.postMessage({hl_removed: {id: oldComposeHl._id}})
        }
      }
      oldComposeHl = composeHl
    })
  } else if (message.highlight) {
    var hl = message.highlight
    hl.sourceUrl  = Session.get("sourceUrl")
    hl._id = "composeHl"
    Session.set("composeHl", hl)
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
