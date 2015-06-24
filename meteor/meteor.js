Hls     = new Mongo.Collection('hls')     //highlights
Annotes = new Mongo.Collection('annotes') //annotations

annotationPlaceholder = '<span class="annotation-placeholder"></span>'

Router.route('/url/:sourceUrl', function () {
  this.render('sidebar', {data: this.params});
  Session.set('sourceUrl', this.params.sourceUrl)
});

Meteor.startup(function() {
  Meteor.methods({
    addDraftHl:
      function(hl) {
        if(!this.userId) { return null }
        check(hl, Match.highlight)
        hl.draft     = true
        hl.createdAt = new Date()
        hl.author = this.userId
        return Hls.insert(hl)
      },
    removeHl:
      function(hl_id) {
        check(hl_id, String)
        Hls.remove({author: this.userId, _id: hl_id})
      },
    addDraftAnnotation:
      function(id) {
        if(!this.userId) { return null }
        check(id, String)
        Annotes.insert({
          author:    this.userId,
          createdAt: new Date(),
          draft:     true,
          content:   "",
          inReplyTo: id
        })
      },
    updateDraft:
      function(id, content) {
        if(!this.userId) { return null }
        check(id, String)
        check(content, String)
        if(Meteor.isServer) {
          content   = sanitizeHtml(content, {
            allowedTags: ['b','i','u','strike','ul','ol','li','blockquote','a','table','thead','caption','tbody','tr','th','td','pre','br'],
            allowedAttributes: {
              'a': ['href']
            },
            transformTags: {
              'div': 'br',
              'p': 'br'
            }
          })
        }
        Annotes.update({_id: id, author: this.userId, draft: true}, {$set: {content: content, editedAt: new Date()}})
        Annotes.update({_id: id, author: this.userId, "editing.content": {$exists: true}}, {$set: {"editing.content": content, "editing.editedAt": new Date()}})
      },
    discardDraft:
      function(id) {
        Hls.remove({author: this.userId, draft: true, _id: Annotes.findOne(id).inReplyTo})
        Annotes.remove({author: this.userId, draft: true, _id: id})
        Annotes.update({author: this.userId, _id: id, "editing.content": {$exists: true}}, {$unset: {editing: ""}})
      },
    saveAnnotation:
      function(id) {
        if(!this.userId) { return null }
        var now = new Date()
        var annote = Annotes.findOne(id)
        if(annote.editing && annote.editing.content !== annote.content) {
          check(annote.editing.content, Match.nonEmptyString)
          Annotes.update({author: this.userId, _id: id},{$set: {content: annote.editing.content, editedAt: annote.editing.editedAt}, $unset: {editing: ""}})
        } else {
          check(annote.content, Match.nonEmptyString)
          Annotes.update({author: this.userId, draft: true, _id: id}, {$set: {draft: false, publishedAt: now}})
          Hls.update({author: this.userId, draft: true, _id: annote.inReplyTo}, {$set: {draft: false, publishedAt: now}})
        }
      },
    edit:
      function(id) {
        Annotes.update({author: this.userId, _id: id}, {$set: {editing: {content: Annotes.findOne(id).content}}})
      }
  })
})
