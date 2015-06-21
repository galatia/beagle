var screenshot = {}

var screenshotMouseDown = function(e) {
  var page = findPage(event.pageY)
  var pageRect = getPageRect(page)
  screenshot.page = page
  screenshot.x0 = event.pageX - pageRect.left
  screenshot.y0 = event.pageY - pageRect.top
  var elem = document.createElement('div')
  elem.classList.add('active-screenshot')
  elem.style.left   = screenshot.x0 + "px"
  elem.style.top    = screenshot.y0 + "px"
  elem.style.width  =                "0px"
  elem.style.height =                "0px"
  screenshot.elem = elem
  page.canvas.parentElement.parentElement.appendChild(elem)
  var container = document.getElementById('viewerContainer')
  container.addEventListener('mousemove', screenshotMouseMove, true)
  container.removeEventListener('mousedown', screenshotMouseDown, true)
}

var screenshotMouseMove = function(e) {
  var pageRect = getPageRect(screenshot.page)
  screenshot.x1 = event.pageX - pageRect.left
  screenshot.y1 = event.pageY - pageRect.top
  screenshot.xMax = Math.min(Math.max(screenshot.x0, screenshot.x1), pageRect.width)
  screenshot.yMax = Math.min(Math.max(screenshot.y0, screenshot.y1), pageRect.height)
  screenshot.xMin = Math.max(Math.min(screenshot.x0, screenshot.x1),0)
  screenshot.yMin = Math.max(Math.min(screenshot.y0, screenshot.y1), 0)
  var elem = screenshot.elem
  elem.style.left   = screenshot.xMin + "px"
  elem.style.top    = screenshot.yMin + "px"
  elem.style.width  = screenshot.xMax - screenshot.xMin + "px"
  elem.style.height = screenshot.yMax - screenshot.yMin + "px"
  var container = document.getElementById('viewerContainer')
  container.addEventListener('mouseup', screenshotMouseUp, true)
}

function leaveScreenshotMode(e) {
  if(!e || !e.dontLeaveScreenshotMode) {
    screenshot.elem.remove()
    removeCurrentHoverbox()
    document.getElementById('viewerContainer').classList.remove('screenshot-mode','inactive')
    document.addEventListener('mouseup', highlightHandler)
    document.removeEventListener('mouseup', leaveScreenshotMode)
  }
}

var screenshotMouseUp = function(e) {
  var container = document.getElementById('viewerContainer')
  container.removeEventListener('mousemove', screenshotMouseMove, true)
  var pdfMin = screenshot.page.viewport.convertToPdfPoint(screenshot.xMin, screenshot.yMin)
  var pdfMax = screenshot.page.viewport.convertToPdfPoint(screenshot.xMax, screenshot.yMax)
  makeHoverbox(e.pageX, e.pageY + 15)
  var highlightButtonHandler = function(event) {
    console.log(screenshot)
    port.postMessage({highlight: {rects: [{page: screenshot.page.id-1, xMin: pdfMin[0], xMax: pdfMax[0], yMin: pdfMin[1], yMax: pdfMax[1]}], text: "[Screenshot on page "+screenshot.page.id+"]"}})
  }
  container.classList.add('inactive')
  container.removeEventListener('mouseup', screenshotMouseUp, true)
  hoverbox.addEventListener('mouseup', highlightButtonHandler)
  document.addEventListener('mouseup', leaveScreenshotMode)
  e.dontLeaveScreenshotMode = true
}

function enterScreenshotMode() {
  if(document.getElementById('viewerContainer').classList.contains('screenshot-mode')) {
    leaveScreenshotMode()
  }
  removeCurrentHoverbox()
  document.removeEventListener('mouseup', highlightHandler)
  var container = document.getElementById('viewerContainer')
  container.classList.add('screenshot-mode')
  screenshot.x0 = screenshot.y0 = screenshot.x1 = screenshot.y1 = null;
  container.addEventListener('mousedown', screenshotMouseDown, true)
}

