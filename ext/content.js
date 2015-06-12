var appHost  = 'http://localhost:3000/' //'http://QfjWnhEakV93XtaEjWaxqFZws.meteor.com'
var paperURL = window.location.href


// Make iframe for PDF viewer and Meteor sidebar
document.getElementsByTagName('embed')[0].remove()

var pdf = document.createElement('iframe')
pdf.setAttribute('src', chrome.extension.getURL('pdfjs/web/viewer.html')+'?file='+encodeURIComponent(paperURL))
pdf.setAttribute('height', '100%')
pdf.setAttribute('width', '75%')
pdf.setAttribute('style', 'position:absolute; left:0; background-color:white')
document.getElementsByTagName('body')[0].appendChild(pdf)

var sidebar = document.createElement('iframe')
sidebar.setAttribute('src', appHost+'url/'+encodeURIComponent(paperURL))
sidebar.setAttribute('height', '100%')
sidebar.setAttribute('width', '25%')
sidebar.setAttribute('style', 'position:absolute; right:0; background-color:white')
document.getElementsByTagName('body')[0].appendChild(sidebar)
