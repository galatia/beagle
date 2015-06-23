// Connect the port to ext (by which it talks to meteor)
port = chrome.runtime.connect('odpjnchpigjffflggljcadppijpjjiho')

// Handle incoming messages
port.onMessage.addListener(function(msg) {
  console.log('viewer got ', msg)

  /* Highlight related msgs */

  // Handle messages that contain hls
  if(msg.hl_added) {
    var hl = msg.hl_added
    if(hls[hl._id] == undefined) {
      renderHl(hls[hl._id] = hl)
    }
  }
  else if (msg.hl_changed) {
    var id = msg.hl_changed.id
    for(var key in msg.hl_changed.fields) {
      hls[id][key] = msg.hl_changed.fields[key]
    }
    renderHl(hls[id])
  }
  else if (msg.hl_removed) {
    var id = msg.hl_removed.id
    removeHl(hls[id])
    hls[id] = undefined
  }
  // Handle hovered highlight on meteor side
  else if (msg.hover !== undefined) {
    updateHlClass('hover', msg.hover, hls[msg.hl_id])
  }
  // Handle clicked highlight on meteor side
  else if (msg.clicked !== undefined) {
    if(msg.clicked) {
      scrollToHl(msg.hl_id)
    }
    updateHlClass('clicked', msg.clicked, hls[msg.hl_id])
  }

  /* Screenshot related msgs */

  else if (msg.mode == 'screenshot') {
    enterScreenshotMode()
  }
})
