alert('Hello from the Beagle Chrome extension!')

document.getElementsByTagName('embed')[0].setAttribute('width', '75%')

var sidebar = document.createElement('iframe')
sidebar.setAttribute('src',   'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com')
sidebar.setAttribute('width', '25%')
sidebar.setAttribute('height', '100%')
sidebar.setAttribute('style', 'position:absolute; right:0; background-color:white')
document.getElementsByTagName('body')[0].appendChild(sidebar)
