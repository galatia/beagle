Meteor.startup(function() {
  Meteor.publishComposite("annotations", function(sourceUrl) {
    check(sourceUrl, String)
    var recursiveAnnotes = {
      find: function(hl) {
        return Annotes.find({inReplyTo: hl._id})
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
