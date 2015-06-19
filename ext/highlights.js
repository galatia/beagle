// Once pdf loads, pass to port info about it
document.addEventListener('pagesloaded', function (){
  port.postMessage({pdfCreator: PDFViewerApplication.documentInfo.Creator})
})

// Map from hl_id to hl object
hls = {} // :: {hl_id: {hl_rects: [hl_rect], elems: [elem], hover: bool, clicked: bool, top: {page::num, y::num}}}  ; only hl_rects stored in mongo, rest is computed
// Map from page num to hls touching that page
hlsByPage = {} // :: {page: {hl_id: hl}}

// Add or rm class from all rect elem in hl
function updateHlClass(className, bool, hl) {
  hl[className] = bool
  msg = {}
  msg[className] = bool
  msg['id'] = hl.id
  port.postMessage(msg)
  for(var i=0; i<hl.elems.length; i++) { // add/rm class 'hover' to elems
    hl.elems[i].classList[bool?'add':'remove'](className)
  }
}

// Render hl: generate elems from rects
function renderHl(hl) {
  hl.elems = []
  // wrap udateHlClass in closure for listener
  var listenerGenerator = function(className, bool, hl) {
    return function (e) {
      return updateHlClass(className, bool, hl)
    }
  }
  // create listeners for each event type
  var mouseEnterListener = listenerGenerator('hover', true, hl)
  var mouseLeaveListener = listenerGenerator('hover', false, hl)
  var mouseClickListener = listenerGenerator('clicked', true, hl)

  // Go through each rect in the hl to generate each elem, and compute top
  hl.top = {}
  for(var i=0; i < hl.hl_rects.length; i++){
    var rect = hl.hl_rects[i]
    var page = rect.page
    // update hlsByPage object
    if(hlsByPage[page]===undefined) {hlsByPage[page]={}}
    hlsByPage[page][hl.id]=hl;

    // coordinate transform (pdf->viewport)
    var pageObj = PDFViewerApplication.pdfViewer.pages[page]
    var min  = pageObj.viewport.convertToViewportPoint(rect.xMin, rect.yMin)
    var max  = pageObj.viewport.convertToViewportPoint(rect.xMax, rect.yMax)

    // add highlight boxes on top of text
    var elem = document.createElement('div')
    elem.classList.add('highlight')
    elem.style.left   =           min[0]  + "px"
    elem.style.top    =           min[1]  + "px"
    elem.style.width  = (max[0] - min[0]) + "px"
    elem.style.height = (max[1] - min[1]) + "px"
    hl.elems.push(elem)
    elem.addEventListener('mouseenter', mouseEnterListener)
    elem.addEventListener('mouseleave', mouseLeaveListener)
    elem.addEventListener('click', mouseClickListener)
    pageObj.canvas.parentElement.parentElement.appendChild(elem)

    // track hl.top.elem to know where to scroll
    if(hl.top.page===undefined || page <= hl.top.page) {
      if(page < hl.top.page || hl.top.y===undefined || rect.yMax > hl.top.y) {
        hl.top.y = rect.yMax
        hl.top.elem = elem
      }
      hl.top.page = page
    }
  }
}

// When page is re-rendered, re-render highlights for page too
document.addEventListener('pagerendered', function(e) {
  var page = e.detail.pageNumber - 1; // which page was re-rendered
  if(hlsByPage[page]) {
    for(var id in hlsByPage[page]) {
      if(hlsByPage[page].hasOwnProperty(id)) {
        renderHl(hls[id])
      }
    }
  }
})

function getPageRect(page) { // get rect of that page, as helper for getPage(y)
  return page.canvas.getClientRects()[0]
}
function getPage(n) {
  return PDFViewerApplication.pdfViewer.pages[n]
}

// Scroll viewer so hl is at top
function scrollToHl(hl_id) {
  var viewerContainer = document.getElementById('viewerContainer')
  var viewerContainerTop = viewerContainer.getClientRects()[0].top
  viewerContainer.scrollTop += (hls[hl_id].top.elem.getClientRects()[0].top - viewerContainerTop)
}

// When text is selected, display hoverbox where the mouse is
var hoverbox = false;
var highlightHandler = function(event) {
  if(hoverbox) {
    document.body.removeChild(hoverbox)
    hoverbox = false
  }
  var selection = window.getSelection()
  if(!selection.isCollapsed) { // TODO not just clicked on empty selection
    var x = event.pageX
    var y = event.pageY + 15
    hoverbox = document.createElement('div')
    hoverbox.classList.add('hoverbox')
    hoverbox.style.left = x + "px"
    hoverbox.style.top  = y + "px"
    document.body.appendChild(hoverbox)

   // Get pages of selection, even if it crosses the boundary
    var currentPage = PDFViewerApplication.pdfViewer.currentPageNumber - 1 // page the viewer is on
    function findPage(y) {
      function _findPage(n) {
        var rect = getPageRect(getPage(n))
        if(y > rect.bottom) {
          return _findPage(n+1)
        } else if (y < rect.top) {
          return _findPage(n-1)
        }
        return getPage(n)
      }
      return _findPage(currentPage)
    }

    // Create & process rects
    var uRects = RangeFix.getClientRects(selection.getRangeAt(0))
    var rects = []
    for(var i = 0; i < uRects.length; i++){
      // remove duplicate
      if (i>0 && uRects[i].top==uRects[i-1].top && uRects[i].bottom==uRects[i-1].bottom && (uRects[i].left==uRects[i-1].left || uRects[i].right == uRects[i-1].right)) continue;
      var uRect = uRects[i]
      var page = findPage(uRect.top)
      var pageRect = getPageRect(page)
      if(uRect.height != pageRect.height || uRect.width != pageRect.width) { // workaround for chrome bug, to check it's not the whole page
        // convert coordinates
        var min = page.viewport.convertToPdfPoint(uRect.left - pageRect.left, uRect.top - pageRect.top)
        var max = page.viewport.convertToPdfPoint(uRect.right - pageRect.left, uRect.bottom - pageRect.top)
        rects.push({page: page.id-1,
                    xMin: min[0],
                    yMin: min[1],
                    xMax: max[0],
                    yMax: max[1]})
      }
    }

    // Pass selected text and rects to meteor on event (clicked)
    var selectedText = selection.toString()
    var highlightButtonHandler = function(event) {
      var msg = {highlight: {text: selectedText, rects: rects}}
      port.postMessage(msg)
    }
    hoverbox.addEventListener('mouseup', highlightButtonHandler)
    hoverbox.addEventListener('touchend', highlightButtonHandler)
  }
}

// Run highlightHandler whenever mouse/finger is lifted/unclicked
document.addEventListener('mouseup', highlightHandler)
document.addEventListener('touchend', highlightHandler)
