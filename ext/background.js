var appHost  = 'http://localhost:3000/' //'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com'

ports = []
var listener = function (port) {
  ports.push(port);
  console.log(port);
  if (ports.length == 2){
    // Listen for message from one and post to other; then the second one
    ports[0].onMessage.addListener(function(message){
      ports[1].postMessage(message)
    })
    ports[1].onMessage.addListener(function(message){
      ports[0].postMessage(message)
    })
  }
}

chrome.runtime.onConnectExternal.addListener(listener)
chrome.runtime.onConnect.addListener(listener)
