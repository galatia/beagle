var appHost  = 'http://localhost:3000/' //'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com'

ports = {}
var listener = function (port) {
  var id = port.sender.tab.id
  if(!ports[id]) {ports[id]={}}
  ports[id][port.sender.id? 'ext':'meteor']=port;
  var port0 = ports[id].ext, port1 = ports[id].meteor
  if (port0 && port1){
    // Listen for message from one and post to other; then the second one
    if(port0.listener) { port0.onMessage.removeListener(port0.listener) }
    if(port1.listener) { port1.onMessage.removeListener(port1.listener) }
    port0.listener = function(message){ port1.postMessage(message) }
    port1.listener = function(message){ port0.postMessage(message) }
    port0.onMessage.addListener(port0.listener)
    port1.onMessage.addListener(port1.listener)
  }
}

chrome.runtime.onConnectExternal.addListener(listener)
chrome.runtime.onConnect.addListener(listener)
