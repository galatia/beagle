//alert('Hello from the Beagle Chrome extension!')

document.getElementsByTagName('embed')[0].remove()

var paperUrl = window.location.href

var sidebar = document.createElement('iframe')
sidebar.setAttribute('src',   'http://localhost:3000/url/'+encodeURIComponent(paperUrl))//'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com')
sidebar.setAttribute('width', '100%')
sidebar.setAttribute('height', '100%')
sidebar.setAttribute('style', 'position:absolute; right:0; background-color:white')
document.getElementsByTagName('body')[0].appendChild(sidebar)

