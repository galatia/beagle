var appHost  = 'http://localhost:3000/' //'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com'

ports = []
var listener = function (port) {
  ports.push(port);
  console.log(port);
  if (ports.length == 2){
    var port0 = ports[0], port1 = ports[1]
    ports = [] // clear for use in new tab
    // Listen for message from one and post to other; then the second one
    port0.onMessage.addListener(function(message){
      port1.postMessage(message)
    })
    port1.onMessage.addListener(function(message){
      port0.postMessage(message)
    })
  }
}

chrome.runtime.onConnectExternal.addListener(listener)
chrome.runtime.onConnect.addListener(listener)
