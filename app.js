var remark = require('remark')
var remarkHtml = require('remark-html')

var map = L.map('map', {zoomControl: false, minZoom: 2})
L.control.zoom({position: 'topright'}).addTo(map)
var markers = {}

var layer = Tangram.leafletLayer({
  scene: 'scene_terrain.yaml',
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

      var icon = art.meta.image !== 'valid' ?
        L.divIcon({html: '<span class="noImage"></span>'}) :
        L.divIcon({
          html: buildCenteredRoundImage(art),
        })

      if(art.coords && art.coords.length > 0) {
        var marker = L.marker(art.coords.reverse(), {
          title: art.meta.title,
          icon: icon,
        })

        marker.on('click', objectDetail);
        function objectDetail(e) {
          console.log(art);
          leftHeaderOpen();
          rightHeaderOpen();
          map.flyTo(e.latlng, 8);
          document.querySelector("#object").innerHTML = '<div>' +
          '<div class="thread_header"><h2>Silk Road</h2>' +
          '<div class="close" onclick="api.uiActions.closeObject()"><i class="material-icons">clear</i></div>' +
          '</div>' +
          '<div class="object_sidebar">' +
            '<div class="image_wrapper"><img src="'+imageUrl(art.meta.id)+'"/></div>' +
            '<div class="object_content">'+
            '<h2>'+art.meta.title+', <span class="dated">'+art.meta.dated+'</span></h2>' +
            '<p>'+art.meta.artist+'</p>'+
            '<p>'+art.meta.medium+'</p>'+
            '<p>Located in '+art.meta.room+'</p>'+
            '<div class="narrative"><p>'+art.__content+'</p></div>'+
            '</div>'+
          '</div>' +
          '</div>'
            }
          function leftHeaderOpen(){
            document.querySelector("#header .left_header").innerHTML = '<div>' +
            '<div class="next">' +
            '<h2>Explore More...</h2>' +
              '</div>' +
            '</div>'
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

      var group = layerGroups[thread] || L.layerGroup()

      var SilkRoad = "#ffff00";
      var Cochineal =  "#ff3145";
      var BlueWhite =  "#007aff";
      var Buddhism = "#00ff01";
      var TriTrade = "#00ffff";
      var ChinaTrade = "#ffb400";
      var Islam = "#7956b4";
      var color = eval(thread.replace( / |&|-/g, ""));
      var color_tint = new L.rectangle([[85, -180],[-85, 180]], {color: color})
      map.removeLayer(color_tint)

      //layerGroups[thread].addTo(map)
      Object.keys(layerGroups).map(function(layer){
        if (layer == thread){
          map.addLayer(group)
          map.addLayer(color_tint);
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
}
