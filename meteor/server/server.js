Meteor.startup(function() {
  Meteor.publish("userData", function() {
    if (this.userId) {
      return Meteor.users.find({_id: this.userId}, {fields: {"services.google.picture": 1}})
    } else {
      this.ready();
    }
  })

  Meteor.publishComposite("annotations", function(sourceUrl) {
    check(sourceUrl, String)
    var recursiveAnnotes = {
      find: function(hl) {
        return Annotes.find({inReplyTo: hl._id, $or: [{draft: {$ne: true}}, {author: this.userId}]})
      },
      children: [
        {
          find: function(annote) {
            return Meteor.users.find(annote.author, {fields: {profile: 1, "services.google.picture": 1}})
          }
        }
      ]
    }
    recursiveAnnotes.children.push(recursiveAnnotes)
    return {
      find: function() { return Hls.find({sourceUrl: sourceUrl}) },
      children: [ recursiveAnnotes ]
    };
  })
})
