Meteor.startup(function() {
  function findHl(id) {
    if(!id || Hls.findOne(id)) {return id;}
    else {return findHl(Annotes.findOne(id).inReplyTo)}
  }
  Template.highlight.onRendered(function() {
    var sT = this.find(".sourceText")
    sT.innerHTML = this.data.sourceText
  })
  Template.composeBox.onRendered(function() {
    var cF = this.find(".composeField")
    cF.innerHTML = (this.data.editing && this.data.editing.content) || this.data.content
    cF.focus()
    Session.set("clicked", findHl(Template.currentData()._id))
    var sel   = window.getSelection()
    var range = sel.getRangeAt(0)
    range.selectNodeContents(cF)
    sel.removeAllRanges()
    sel.addRange(range)
    sel.collapseToEnd()
    document.execCommand('styleWithCSS',false,false)
  })

  Template.composeBox.events({
    'input [contenteditable]': function(e) {
      Meteor.call("updateDraft", Template.currentData()._id, e.target.innerHTML)
    },
    'click .toolbar button': function(e) {
      window.activeComposeField = Template.instance().find(".composeField")
      var cF = activeComposeField
      cF.focus()
      var cmd = e.currentTarget.getAttribute('data-command')
      cF.normalize()
      if(cmd) {
        document.execCommand(cmd)
        cF.normalize()
      }
    },
    'click .toolbar button.removeFormat': function(e) {
      document.execCommand('removeFormat')
      var sel = window.getSelection()
      var range = sel.getRangeAt(0)
      var textContent = sel.toString()
      var ascendTree = function(r, node, child, set) {
        while(node.parentNode[child] == node && node.parentNode.getAttribute("contenteditable") === null) {
          node = node.parentNode
        }
        r[set](node)
      }
      var beginRange = document.createRange()
      var endRange   = document.createRange()
      var cF = Template.instance().find(".composeField")
      beginRange.setStart(cF,0)
      endRange.setEnd(cF,cF.length || cF.childNodes.length)
      if(range.startOffset > 0)
        beginRange.setEnd(range.startContainer, range.startOffset)
      else ascendTree(beginRange, range.startContainer, "firstChild", "setEndBefore")
      if(range.endOffset < range.endContainer.length || range.endContainer.childNodes.length)
        endRange.setStart(range.endContainer,   range.endOffset)
      else ascendTree(endRange, range.endContainer, "lastChild", "setStartAfter")
      var beginFragment = beginRange.extractContents()
      var endFragment   =   endRange.extractContents()
      var textFragment  = document.createDocumentFragment()
      range.deleteContents()

      var appendTextToFragment = function(fragment,text) {
        if (text) {
          var lines = text.split('\n')
          for (var i = 0; i < lines.length; i++) {
            if(lines[i] !== '') {
              fragment.appendChild(document.createTextNode(lines[i]))
            }
            if (i < lines.length - 1) {
              fragment.appendChild(document.createElement('br'))
            }
          }
        }
        return fragment
      }

      while(cF.firstChild) {cF.removeChild(cF.firstChild)}
      cF.appendChild(beginFragment)
      range.setStart(cF,cF.length || cF.childNodes.length)
      cF.appendChild(appendTextToFragment(textFragment,textContent))
      range.setEnd(cF,cF.length || cF.childNodes.length)
      cF.appendChild(endFragment)

      sel.removeAllRanges()
      sel.addRange(range)

      var cleanup = function(node) {
        var textContent = node.innerText || node.nodeValue
        if(node.childNodes) {
          for (var i = 0; i < node.childNodes.length; i++) {
            var replacement = cleanup(node.childNodes[i])
                 if (replacement === null)  {node.removeChild(node.childNodes[i])}
            else if (replacement !== false) {node.replaceChild(replacement, node.childNodes[i])}
          }
        }
        if(node.tagName == "BR") { return false }
        if (/\S/.test(node.textContent)) {
          if(node.nodeType !== 1 || (textContent && (textContent == textContent.trim()))) {
            return false
          } else {
            var getContent = function(child) {
              return child && (child.innerText || child.nodeValue || (child.tagName=="BR" && "\n"))
            }
            var beginWhitespace = ""
            var beginChild = node.firstChild
            var beginChildContent
            while ((beginChildContent = getContent(beginChild)) && !/\S/.test(beginChildContent)) {
              beginWhitespace = beginWhitespace + beginChildContent
              beginChild = beginChild.nextSibling
            }
            var endWhitespace = ""
            var endChild = node.lastChild
            var endChildContent = endChild.innerText || endChild.nodeValue || (endChild.tagName=="BR" && "\n")
            while ((endChildContent = getContent(endChild)) && !/\S/.test(endChildContent)) {
              endWhitespace = endChildContent + endWhitespace
              endChild = endChild.previousSibling
            }
            var range = document.createRange()
            if(beginChild) { range.setStartBefore(beginChild) }
            else { range.setStartAfter(node.lastChild) }
            if(endChild) { range.setEndAfter(endChild) }
            else { range.setEndBefore(node.firstChild) }

            var contentFragment = range.cloneContents()
            var thisNode = node.cloneNode(false)
            thisNode.appendChild(contentFragment)

            var includeWhitespace = (node.tagName !== "LI") && (node.tagName !== "UL") && (node.tagName !== "OL")

            var fragment = document.createDocumentFragment()
            if(includeWhitespace) { appendTextToFragment(fragment,beginWhitespace) }
            fragment.appendChild(thisNode)
            if(includeWhitespace) { appendTextToFragment(fragment,endWhitespace) }
            return fragment
          }
        }
        if (textContent === "") {
          return null
        }
        return appendTextToFragment(document.createDocumentFragment(), textContent)
      }
      cleanup(cF)
      cF.normalize()
    },
    'click .toolbar button.createLink': function(e) {
      var sel = window.getSelection()
      var y
      window.createLinkRange = sel.getRangeAt(0)
      if(!sel.isCollapsed) {
        y = createLinkRange.getBoundingClientRect().bottom - document.body.getBoundingClientRect().top
      } else {
        y = Template.instance().find(".composeField").getBoundingClientRect().bottom - document.body.getBoundingClientRect().top
      }
      Session.set("linkEdit", {text: sel.toString(), y: y})
    },
    'click .composeField a': function(e) {
      console.log(e)
      window.activeComposeField = Template.instance().find(".composeField")
      e.target.classList.add("previewedLink")
      Session.set("linkPreview", {href: e.target.getAttribute('href'), x: e.pageX, y: e.pageY+8})
      e.keepLinkPreview = true
    },
    'click .composeBox': function(e) {
      if(!e.keepLinkPreview && Session.get("linkPreview")) {
        Session.set("linkPreview", null)
        $(".previewedLink").removeClass("previewedLink")
      }
    },
    'click .save': function() {
      Meteor.call("saveAnnotation", Template.currentData()._id)
    },
    'click .discard': function() {
      Meteor.call("discardDraft", Template.currentData()._id)
    },
    'click .delete': function() {
      var id = Template.currentData()._id
      children = Annotes.find({inReplyTo: id}).count()
      if (window.confirm(children
          ? "This action will also delete all subtrees and cannot be undone. Confirm?"
          : "This deletion cannot be undone. Confirm?")) {
        Meteor.call("delete", id)
      }
    }
  })
  var selectPreviewedLink = function() {
    var link = $(".previewedLink")[0]
    var range = document.createRange()
    range.selectNode(link)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }
  Template.linkPreviewer.events({
    'click a.remove': function(e) {
      selectPreviewedLink()
      document.execCommand("unlink")
      Session.set("linkPreview", null)
    },
    'click a.change': function(e) {
      selectPreviewedLink()
      window.createLinkRange = window.getSelection().getRangeAt(0)
      Session.set("linkPreview", null)
      Session.set("linkEdit", {
        text: window.getSelection().toString(),
        href: Template.instance().data.href,
        y:    Template.instance().data.y
      })
    },
    'click #linkPreviewer': function(e) {
      console.log(e)
      e.keepLinkPreview = true
    }
  })

  Template.linkEditor.onRendered(function() {
    if(this.data.text) {
      var hrefInput = this.find('input[name="href"]')
      hrefInput.focus()
      hrefInput.select()
    } else {
      this.find('input[name="displayText"]').focus()
    }
  })

  Template.linkEditor.events({
    'click button.discard': function(e) {
      e.stopPropagation()
      e.preventDefault()
      Session.set("linkEdit",null)
    },
    'submit, click button.done, keypress input[type="text"]': function(e) {
      if(e.keyCode && e.keyCode !== 13) {return true;}
      e.stopPropagation()
      e.preventDefault()
      if(!Template.instance().find("form").reportValidity()) { return false; }
      window.activeComposeField.focus()
      if(window.createLinkRange) {
        var sel = window.getSelection()
        sel.removeAllRanges()
        var text = Template.instance().find('input[name="displayText"]').value
        if(text !== Template.instance().data.text) {
          createLinkRange.deleteContents()
          createLinkRange.insertNode(document.createTextNode(text))
        }
        sel.addRange(createLinkRange)
        window.createLinkRange = undefined
        var href = Template.instance().find('input[name="href"]').value
        if(href) {
          if(!/^(mailto|https?):/.test(href)) {
            var emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/
            var incompleteUrlRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)+(\/|$)/
            if(emailRegex.test(href)) {
              href = 'mailto:'+href
            } else if(incompleteUrlRegex.test(href)) {
              href = 'http://'+href
            } else {
              console.error("Bad link address: ", href)
              return false
            }
          }
          document.execCommand("createLink", false, href)
          sel.collapseToEnd()
        }
      }
      Session.set("linkEdit",null)
    }
  })
})
