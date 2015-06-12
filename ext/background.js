// Pass creator to Meteor sidebar
chrome.runtime.onConnectExternal.addListener(function (port) {
  port.postMessage({pdfCreator: "MEE"})
})
