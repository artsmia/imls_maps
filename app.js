var remark = require('remark')
var remarkHtml = require('remark-html')

var map = L.map('map', {zoomControl: false, minZoom: 2})
L.control.zoom({position: 'topright'}).addTo(map)
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
  var hasContent = art.__content && art.__content.trim().length > 2

  return "<span " +
  "class='large_marker' " +
  "style='background-image: url("+imageUrl(id)+");'" +
  (hasContent ? "class='hasContent'" : "") +
  "></span>"
}
function buildColoredDotMarker(art) {
  var id = art.meta.id
  //var hasContent = art.__content && art.__content.trim().length > 2
  var dot_color = api.threadColors[art.threads[0]]
  return "<span style='background-color: "+dot_color+";'></span>"
}

function changePopup(id) {
  var marker = api.markers[id]
  marker ? marker.openPopup() : console.info('link to object ', id)
}

function buildArtDetail(art) {
  var meta = art.meta
  var processedContent = remark().use(remarkHtml).process(art.__content)
  var associatedObjects = [art.related, art.next].map(function(group) {
    return '<div class="more">' +
      '<h3>'+group.label+'</h3>' +
      group.ids.map(function(id) {
        return '<img onclick="api.changePopup('+id+')" src="'+imageUrl(id)+'"/>'
      }).join('\n') +
    '</div>'
  }).join('\n') + '<hr />'

  return '<div class="art_detail_wrapper">' +
    '<div class="image_wrapper">' +
    '</div>' +
    '<div class="content_wrapper">' +
    '<h2>'+meta.title+'</h2>' +
    '<img src="'+imageUrl(meta.id)+'"/>' +
    '<div>'+processedContent+'</div>' +
    associatedObjects +
    '</div>' +
  '</div>'
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
  }).join('\n') + '<hr />'

  return '<div class="popup">' +
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
  L.control.layers(layerGroups)
  .setPosition('bottomright')
  .addTo(map)

  // put leaflet markers on the map for each artwork
  var objectIds = Object.keys(json)
  xhr('http://search.artsmia.org/ids/'+objectIds.join(','), function(artJson) {
    var artworks = artJson.hits.hits.forEach(function(artworkMeta) {
      var id = artworkMeta._id
      json[id].meta = artworkMeta._source
    })

    objectIds.map(function(key) {
      var art = json[key]
      var id = art.basename
      var w = art.meta.image_width
      var h = art.meta.image_height
      var r = w/h

      var dot =
        L.divIcon({
          html: buildColoredDotMarker(art),
        })
        var icon =
          L.divIcon({
            html: buildCenteredRoundImage(art),
          })

      if(art.coords && art.coords.length > 0) {
        var marker = L.marker(art.coords.reverse(), {
          title: art.meta.title,
          icon: dot,
        })
        marker.on('click', objectDetail);
        function objectDetail(e) {
          marker.setIcon(icon);
          console.log(art);
          leftHeaderOpen();
          //rightHeaderOpen();
          map.flyTo(e.latlng, 7);

          var firstThread = art.threads[0]
          var recentMatchingThread = art.threads.find(t => t == api.lastActiveThread)
          var thread = recentMatchingThread || firstThread
          console.info('picked', thread, 'from threads', art.threads)

          document.querySelector("#object").innerHTML = `<div>
          <div class="thread_header" style="background-color: ${api.threadColors[thread]} !important"><h2>${thread}</h2>
          </div>
          <div class="close" onclick="api.uiActions.closeObject()"><i class="material-icons">home</i></div>
          <div class="next" onclick="api.uiActions.nextObject()"><i class="material-icons">arrow_forward</i></div>
          <div class="prev" onclick="api.uiActions.prevObject()"><i class="material-icons">arrow_back</i></div>
          <div class="object_sidebar">
            <div class="image_wrapper"><img src="${imageUrl(art.meta.id)}"/>
              <h2>${art.meta.title}, <span class="dated">${art.meta.dated}</span></h2>
              <p>${art.meta.artist}</p>
              <p>${art.meta.medium}</p>
              <p><i class="material-icons">room</i> Located in ${art.meta.room}</p>
            </div>
            <div class="object_content">
              <h2>Headline Placeholder</h2>
              <div class="narrative"><p>${art.__content}</p></div>
            </div>
          </div>
          </div>`
        }
          function leftHeaderOpen(){
            document.querySelector("#header .left_header").innerHTML = ''
          }
          function rightHeaderOpen(){
            document.querySelector("#header .right_header").innerHTML = '<div>' +
            '<div class="next">' +
            '<h2>Enter Content here</h2>' +
              '</div>' +
            '</div>'
          }
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

    var globalMaxBounds = getPaddedBoundsFromLayer(layerGroups['All'], 0.25)
    var nextMove = map._getBoundsCenterZoom(globalMaxBounds)
    map.flyTo(nextMove.center, nextMove.zoom)
  })

})

function getPaddedBoundsFromLayer(layer, pad) {
  return L.geoJson(layer.toGeoJSON())
  .getBounds()
  .pad(pad)
}

map.on('baselayerchange', function(e) {
  var bounds = getPaddedBoundsFromLayer(e.layer, 0.25)
  var nextMove = map._getBoundsCenterZoom(bounds, {});
  map.flyTo(nextMove.center, nextMove.zoom)

})

var uiActions = {
    groupSelected: function (thread) {
      api.lastActiveThread = thread
      var group = layerGroups[thread] || L.layerGroup()
      var color = api.threadColors[thread]

      //layerGroups[thread].addTo(map)
      Object.keys(layerGroups).map(function(layer){
        if (layer == thread){
          map.addLayer(group)
        } else {
          map.removeLayer(layerGroups[layer])
        }
      })
  },
  closeObject : function (){
    document.querySelector("#object").innerHTML = ""
    var globalMaxBounds = getPaddedBoundsFromLayer(layerGroups['All'], 0.25)
    var nextMove = map._getBoundsCenterZoom(globalMaxBounds)
    map.flyTo(nextMove.center, nextMove.zoom)
    leftHeaderClosed();
    rightHeaderClosed();
    function leftHeaderClosed(){
      document.querySelector("#header .left_header").innerHTML = '<h1><span>Explore</span> Mia\'s Global Collection <br>through World History</h1>'
    }
    function rightHeaderClosed(){
      document.querySelector("#header .right_header").innerHTML = '<div class="arrow">' +
        '<i class="material-icons">arrow_downward</i>' +
      '</div> '+
      '<div class="instruction"> '+
        '<h2><span>Select</span> a topic below to begin your journey.</h2> '+
      '</div>'
    }

  }

}

window.api = {
  map: map,
  markers: markers,
  changePopup: changePopup,
  layerGroups: layerGroups,
  uiActions: uiActions,
  threadColors: {
    'Silk Road': "#ffff00",
    'Cochineal':  "#ff3145",
    'Blue & White':  "#007aff",
    'Buddhism': "#00ff01",
    'Triangle Trade': "#00ffff",
    'China Trade': "#ffb400",
    'Islam': "#7956b4",
  },
  lastActiveThread: false,
}
