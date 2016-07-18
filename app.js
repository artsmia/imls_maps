var remark = require('remark')
var remarkHtml = require('remark-html')

var map = L.map('map')
var markers = {}

var layer = Tangram.leafletLayer({
  scene: 'scene.yaml',
  attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
})

layer.addTo(map)

map.setView([44.95833, -93.27434], 2)

var hash = new L.Hash(map)

function xhr(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.onload = function(e) {
    callback(this.response)
  }
  xhr.send()
}

function loadMappedArtworks(callback) {
  xhr('objects.json', callback)
}

function imageUrl(id) {
  return "http://"+id%7+".api.artsmia.org/"+id+".jpg"
}

function buildCenteredRoundImage(art) {
  var id = art.meta.id
  var hasContent = art.__content.trim().length > 2

  return "<span " +
  "style='background-image: url("+imageUrl(id)+");'" +
  (hasContent ? "class='hasContent'" : "") +
  "></span>"
}

function changePopup(id) {
  var marker = api.markers[id]
  marker ? marker.openPopup() : console.info('link to object ', id)
}

function buildPopup(art) {
  var meta = art.meta
  var processedContent = remark().use(remarkHtml).process(art.__content)
  var associatedObjects = [art.related, art.next].map(function(group) {
    return '<div class="more">' +
      '<h3>'+group.label+'</h3>' +
      group.ids.map(function(id) {
        return '<img onclick="api.changePopup('+id+')" src="'+imageUrl(id)+'"/>'
      }).join('\n') +
    '</div>'
  })

  return '<div>' +
    '<h2>'+meta.title+'</h2>' +
    '<img src="'+imageUrl(meta.id)+'"/>' +
    '<div>'+processedContent+'</div>' +
    associatedObjects +
  '</div>'
}

function buildLayerGroups(json) {
  var threads = new Set(
    Object.keys(json)
    .filter(function(id) { return !!json[id].coords })
    .map(function(id) { return json[id].threads })
    .reduce(function(a, b) { return a.concat(b) }) // flatten
    .filter(function(v) { return !!v })
  )

  return Array.from(threads)
  .reduce(function(groups, thread) {
    console.info(groups, thread)
    groups[thread] = L.layerGroup()
    return groups
  }, {})
}

var layerGroups = {
  'All': L.layerGroup(),
}

layerGroups['All'].addTo(map)

loadMappedArtworks(function(json) {
  layerGroups = Object.assign(layerGroups, buildLayerGroups(json))
  L.control.layers(layerGroups).addTo(map)

  // put leaflet markers on the map for each artwork
  // TODO: load metadata in one go and zip it with map content (/ids/<ids.join(',')> instead of /id/<id>)
  Object.keys(json).map(function(key) {
    var art = json[key]
    var id = art.basename
    xhr('http://search.artsmia.org/id/'+id, function(json) {
      art.meta = json
      var w = json.image_width
      var h = json.image_height
      var r = w/h

      var icon = json.image !== 'valid' ?
        L.Icon.Default() :
        L.divIcon({
          html: buildCenteredRoundImage(art),
        })

      if(art.coords && art.coords.length > 0) {
        var marker = L.marker(art.coords.reverse(), {
          title: art.meta.title,
          icon: icon,
        })

        marker.bindPopup(buildPopup(art), {
          maxWidth: '700',
        })
        markers[art.meta.id] = marker

        layerGroups['All'].addLayer(marker)
        if(art.threads) {
          art.threads.forEach(function(thread) {
            var group = layerGroups[thread] || L.layerGroup()
            group.addLayer(marker)
            if(!layerGroups[thread]) { layerGroups[thread] = group }
          })
        }
      }
    })
  })
})

window.api = {
  map: map,
  markers: markers,
  changePopup: changePopup,
  layerGroups: layerGroups,
}
