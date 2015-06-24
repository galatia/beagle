Match.httpUrl        = Match.Where(function(x) { check(x,String); return /^http/.test(x); })
Match.nonEmptyString = Match.Where(function(x) { check(x,String); return x.length>0; })
Match.highlight      =
  {
    sourceUrl:  Match.httpUrl,
    rects:      [{page: Match.Integer,
                  xMin: Number, xMax: Number,
                  yMin: Number, yMax: Number}],
    sourceText: Match.Optional(String)
  }
