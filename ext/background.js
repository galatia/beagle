ports = {}
var listener = function (port) {
  var id = port.sender.tab.id
  var which = port.sender.id? 'ext':'meteor'
  var other = port.sender.id? 'meteor':'ext'
  if(!ports[id]) {ports[id]={}}
  ports[id][which]=port;
  console.log("adding "+which+"->"+other+" connection")
  port.onMessage.addListener(function(message){
    console.log(port.sender.tab.id,port.sender.id,"received",message)
    if(port!==ports[id][which]) {
      console.warn("abandoned ",port," doesn't match ",ports[id]);
      return;
    }
    console.log("received "+which+"->"+other+" ",message,"for port",ports[id][other]);
    if(ports[id][other]) {
      ports[id][other].postMessage(message)
    } else {
      console.warn(message,"undeliverable")
    }
  })
  if(ports[id][which] && ports[id][other]) {
    ports[id].ext.postMessage({"hello" : "hello"})
  }
}

chrome.runtime.onConnectExternal.addListener(listener)
chrome.runtime.onConnect.addListener(listener)
