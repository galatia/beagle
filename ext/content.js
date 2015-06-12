//alert('Hello from the Beagle Chrome extension!')

var appHost  = 'http://localhost:3000/' //'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com'
var paperUrl = window.location.href

document.getElementsByTagName('embed')[0].remove()

var sidebar = document.createElement('iframe')
sidebar.setAttribute('src', appHost+'url/'+encodeURIComponent(paperUrl))
sidebar.setAttribute('width', '100%')
sidebar.setAttribute('height', '100%')
sidebar.setAttribute('style', 'position:absolute; right:0; background-color:white')
document.getElementsByTagName('body')[0].appendChild(sidebar)
