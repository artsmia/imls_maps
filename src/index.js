var glob = require('glob-fs')({ gitignore: true })
var m2j = require('./markdown-to-json-rollup')

var files = glob.readdirSync('**/*.md')
var json = m2j(files)

if (require.main === module) {
  console.info(JSON.stringify(json))
} else {
  module.exports = json
}


