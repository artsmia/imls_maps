var _m2j = require('markdown-to-json-with-content')

var defaultTransform = function(json) {
  return json[0]
}

module.exports = function m2j(files, transform) {
  var transform = transform || defaultTransform

  return transform(
    JSON.parse(
      _m2j.parse(files, {
        minify: false,
        width: 80,
        outfile: null,
      })
    )
  )
}

