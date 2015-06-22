Meteor.startup(function() {
  Meteor.methods({
    addAnnotation: function(annotation) {
      console.log("in addAnnotation!")
      console.log(annotation)
      if(!this.userId) { return null }
      check(annotation, {
        content:   Match.nonEmptyString,
        inReplyTo: Match.OneOf(Match.httpUrl, Match.highlight)
      })
      var now = new Date()
      var hl_id = undefined
      if(Match.test(annotation.inReplyTo, Match.highlight)) {
        var hl = annotation.inReplyTo
        hl.author    = this.userId
        hl.createdAt = now
        hl_id = Hls.insert(hl)
        annotation.inReplyTo = hl_id
      }
      annotation.author    = this.userId
      annotation.createdAt = now
      console.log(annotation)
      var annote_id = Annotes.insert(annotation)
      return {hl: hl_id, annote: annote_id}
    }
  })

  Meteor.publishComposite("annotations", function(sourceUrl) {
    check(sourceUrl, String)
    return {
      find: function() { return Hls.find({sourceUrl: sourceUrl}) },
      children: [
        {
          find: function(hl) {
            return Annotes.find({inReplyTo: hl._id})
          }
        }
      ]
    };
  })

})
