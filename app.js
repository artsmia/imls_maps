var map = L.map('map')

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

function buildCenteredRoundImage(art) {
  var id = art.id
  return "<span style='background-image: url(http://"+id%7+".api.artsmia.org/"+id+".jpg);'></span>"
}

loadMappedArtworks(function(json) {
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
          html: buildCenteredRoundImage(json),
        })

      if(art.coords && art.coords.length > 0) {
        var marker = L.marker(art.coords.reverse(), {
          title: art.meta.title,
          icon: icon,
        })

        marker.addTo(map)
      }
    })
  })
})
