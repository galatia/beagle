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
        hl.contentOrder = {}
        for(var i=0; i < hl.rects.length; i++){
          var rect = hl.rects[i]
          var page = rect.page
          if(hl.contentOrder.page===undefined || page <= hl.contentOrder.page) {
            if(page < hl.contentOrder.page || hl.contentOrder.y===undefined || rect.yMax > hl.contentOrder.y) {
              if(page < hl.contentOrder.page || rect.yMax > hl.contentOrder.y || hl.contentOrder.x===undefined || rect.xMin < hl.contentOrder.x) {
                hl.contentOrder.x = rect.xMin
              }
              hl.contentOrder.y = rect.yMax
            }
            hl.contentOrder.page = page
          }
        }
        return Hls.insert(hl)
      },
    addDraftAnnotation:
      function(id, newThread) {
        if(!this.userId) { return null }
        check(id, String)
        var newId = Annotes.insert({
          author:    this.userId,
          createdAt: new Date(),
          draft:     true,
          content:   "",
          inReplyTo: id,
          thread:    !newThread && Annotes.findOne(id).thread
        })
        if(newThread) {
          Annotes.update({_id: newId}, {$set: {thread: newId}})
        }
      },
    reviseSourceText:
      function(id, content) {
        if(!this.userId) { return null }
        check(id, String)
        check(content, String)
        if(Meteor.isServer) {
          content = sanitizeHtml(content, {allowedTags: []})
        }
        Hls.update({_id: id, author: this.userId}, {$set: {sourceText: content}})
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
        Annotes.update({author: this.userId, _id: id, "editing.content": {$exists: true}}, {$set: {editing:null}})
      },
    saveAnnotation:
      function(id) {
        if(!this.userId) { return null }
        var now = new Date()
        var annote = Annotes.findOne(id)
        if(annote.editing && annote.editing.content) {
          check(annote.editing.content, Match.nonEmptyString)
          Annotes.update({author: this.userId, _id: id},{$set: {content: annote.editing.content, editedAt: annote.editing.editedAt, editing:null}})
          now = annote.editing.editedAt
        } else {
          check(annote.content, Match.nonEmptyString)
          Annotes.update({author: this.userId, draft: true, _id: id}, {$set: {draft: false, publishedAt: now}})
          Hls.update({author: this.userId, draft: true, _id: annote.inReplyTo}, {$set: {draft: false, publishedAt: now}})
        }
        if(Meteor.isServer) {
          var activityNow = {$max: {activityAt: now}}
          var propagateActivity = function(id) {
            if(!Annotes.update({_id: id}, activityNow)) {
              Hls.update({_id: id}, activityNow)
            } else {
              propagateActivity(Annotes.findOne(id).inReplyTo)
            }
          }
          propagateActivity(id)
        }
      },
    edit:
      function(id) {
        Annotes.update({author: this.userId, _id: id}, {$set: {editing: {content: Annotes.findOne(id).content}}})
      },
    delete:
      function delete_(id) {
        /* Recursive delete
        var hl_id = Annotes.findOne(id).inReplyTo
        Annotes.remove({_id: id})
        Annotes.find({inReplyTo: id}).forEach(function(child) {
          delete_(child._id)
        })
        if (!(Annotes.find({inReplyTo: hl_id}).count())) {
          Hls.remove(hl_id)
        }
        */
        var inReplyTo = Annotes.findOne(id).inReplyTo
        var children = Annotes.find({inReplyTo: id}).count()
        if(children) {
          Annotes.update({_id: id, author: this.userId}, {$set: {content: '<i class="deleted">Deleted</i>', author: null, createdAt: null, publishedAt: null, editedAt: null, editing: null, deleted: true}})
        } else {
          Annotes.remove({_id: id, author: this.userId})
        }
        if(Annotes.findOne(inReplyTo).deleted) {
          delete_(inReplyTo)
        }
      }
  })
  moment.locale('en', {
    relativeTime : {
      future: "in %s",
      past:   "%s ago",
      s:  "seconds",
      ss: "%dsec",
      m:  "1min",
      mm: "%dmin",
      h:  "1hr",
      hh: "%dhr",
      d:  "1d",
      dd: "%dd",
      M:  "a month",
      MM: "%d months",
      y:  "a year",
      yy: "%d years"
    }
  });
})
