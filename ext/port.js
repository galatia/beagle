// Connect the port to ext (by which it talks to meteor)
port = chrome.runtime.connect('odpjnchpigjffflggljcadppijpjjiho')

// Handle incoming messages
port.onMessage.addListener(function(msg) {

  /* Highlight related msgs */

  // Handle messages that contain hls
  if(msg.hl_rects) {
    if(hls[msg.id] == undefined) {
      renderHl(hls[msg.id] = msg)
    }
  }
  // Handle hovered highlight on meteor side
  else if (msg.hover !== undefined) {
    updateHlClass('hover', msg.hover, hls[msg.hl_id])
  }
  // Handle clicked highlight on meteor side
  else if (msg.clicked !== undefined) {
    updateHlClass('clicked', msg.clicked, hls[msg.hl_id])
    scrollToHl(msg.hl_id)
  }


})
