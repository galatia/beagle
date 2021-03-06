(function connectPort() {
  console.log("client connectPort")
  window.port = chrome.runtime.connect("odpjnchpigjffflggljcadppijpjjiho")
  port.onDisconnect.addListener(function() {setTimeout(connectPort,150)})

  var initPort = function() {
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

    var hlClassAutorun = function(className) {
      var oldId = null
      Tracker.autorun(function() {
        console.log("hlClassAutorun", className)
        var msg = {}
        var currentId = Session.get(className)
        if (oldId && oldId != currentId) {
          msg[className] = false
          msg.hl_id      = oldId
          port.postMessage(msg)
        }
        if(currentId) {
          msg[className] = true
          msg.hl_id      = oldId = currentId
          port.postMessage(msg)
        }
      })
    }
    hlClassAutorun('clicked')
    hlClassAutorun('hover')
  }

  port.onMessage.addListener(function (message) {
    if(message.documentInfo) {
      Session.set("documentInfo", message.documentInfo)
      Meteor.startup(initPort)
    } else if (message.pdfCreator) {
      Session.set("documentInfo", {pdfCreator: message.pdfCreator})
      Meteor.startup(initPort)
    } else if (message.highlight) {
      var hl = message.highlight
      hl.sourceUrl  = Session.get("sourceUrl")
      Meteor.call("addDraftHl", hl, function(err, hl_id) {
        Meteor.call("addDraftAnnotation", hl_id, true)
      })
    } else if (message.hover !== undefined) {
      if (message.hover) {
        Session.set("hover", message._id) // hl_id is the one thing set to hover
      } else {
        Session.set("hover", false)
      }
    } else if (message.clicked !== undefined) {
      if(message.clicked) {
        Session.set("clicked", message._id)
      } else {
        Session.set("clicked", false)
      }
    }
  })
})()
