var remark = require('remark')
var remarkHtml = require('remark-html')
var allThreads = require('./threads.json')
Object.keys(allThreads).map(key => {
  var thread = allThreads[key]
  allThreads[key].facts = thread.__content
    .split('\n')
    .filter(fact => fact !== '')
  thread.title = thread.thread[0]
})
var activeThreads = [
  'buddhism',
  'silk-road',
  'red-dye-from-mexico',
  'blue-white',
  'asian-design-and-influence',
  'silver',
  'china-trade',
].map(t => allThreads[t]).filter(t => !!t)

var map = L.map('map', {zoomControl: false, minZoom: 2})
L.control.zoom({position: 'topright'}).addTo(map)
var markers = {}

var layer = Tangram.leafletLayer({
  scene: 'scene.yaml',
  attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
})
layer.addTo(map)

map.setView([44.95833, -93.27434], 2)

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
  // var id = art.meta.id
  //var hasContent = art.__content && art.__content.trim().length > 2
  var thread = art.threads ? art.threads[0] : art.thread[0]
  var dot_color = api.threadColors[thread]
  return "<span style='background-color: "+dot_color+";'></span>"
}

function changePopup(id) {
  var marker = api.markers[id]
  marker ? marker.openPopup() : console.info('link to object ', id)
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

function changeDisplay(art){
  if (!isNaN(art)) {
    art = api.object_json[art]
  }
  art.marker.setIcon(art.icon);
  leftHeaderOpen();
  api.map.panToOffset(art.marker._latlng, [-200, 0]);

  var firstThread = art.threads[0]
  var recentMatchingThread = art.threads.find(t => t == api.lastActiveThread)
  var thread = recentMatchingThread || firstThread
  console.info('picked', thread, 'from threads', art.threads)

  var threadInfo = api.activeThreads.find(t => t.title == thread)
  if(threadInfo) uiActions.updateQuickFacts(threadInfo)

  var siblingArtIds = threadInfo.artIds
  var thisIndex = siblingArtIds.indexOf(art.id)
  var nextId = siblingArtIds[(thisIndex+1)%(siblingArtIds.length)]
  var prevId = siblingArtIds[Math.max(0, (thisIndex-1)%(siblingArtIds.length))]

  if(art.__content.trim() == "") {
    return api.changeDisplay(api.object_json[nextId])
  }

  var _content = art.__content.trim().split("\n\n")
  var needle = _content.findIndex(string => string.indexOf(thread) > -1)
  var heading = _content[needle+1].replace(/###* /, '')
  var content = _content.splice(needle+2).join("\n\n")
  if(_content.findIndex(string => string.indexOf('* * *') > -1)) content = content.split('* * *')[0]
  if(needle == -1) heading += ' [CONTENT NEEDED FOR THIS THREAD?]'

  var relatedObjects = art.relateds.map(function(id) {
    return `<div class="related">
        <a href="https://artsmia.org/art/${id}"><img src="${imageUrl(id)}" /></a>
    </div>`
  }).join('\n')

  var additionalThreads = art.threads
  .filter(t => t !== thread)
  .map(thread => {
    var threadInfo = api.activeThreads.find(t => t.title == thread)
    return threadInfo && `<a onclick="api.changeThreadAndDisplay(${art.id}, '${thread}')" class="additionalThread">
      <img src="${imageUrl(threadInfo.artIds.find(id => id !== art.meta.id))}" />
      ${thread}
    </a>`
  })

  var showAdditionalThreads = additionalThreads.length > 0 && `<div class="additionalThreads">
    <h2>See How This relates to other routes</h2>
    ${additionalThreads}
  </div>`

  document.querySelector("#object").innerHTML = `<div>
  <div class="thread_header" style="background-color: ${api.threadColors[thread]} !important"><h2>${thread}</h2>
  </div>
  <div class="close" onclick="api.uiActions.closeObject()"><i class="material-icons">close</i></div>
  <div class="home" onclick="api.uiActions.closeObject(true)"><i class="material-icons">home</i></div>
  <div class="next" onclick="(function(){api.changeDisplay(api.object_json[${nextId}])})()"><span class="large_marker" style="background-image: url('${imageUrl(nextId)}');"></span><i class="material-icons">arrow_forward</i></div>
  <div class="prev" onclick="(function(){api.changeDisplay(api.object_json[${prevId}])})()"><span class="large_marker" style="background-image: url('${imageUrl(prevId)}');"></span><i class="material-icons">arrow_back</i></div>
  ${showAdditionalThreads}
  <div class="object_sidebar">
    <div class="image_wrapper"><img src="${imageUrl(art.meta.id)}"/>
      <h2>${art.meta.title}, <span class="dated">${art.meta.dated}</span></h2>
      <p>${art.meta.artist}</p>
      <p>${art.meta.medium}</p>
      <p><i class="material-icons">room</i> Located in ${art.meta.room}</p>
    </div>
    <div class="object_content">
      <h2>${heading}</h2>
      <div class="narrative"><p>${content}</p></div>
      ${relatedObjects}
    </div>
  </div>
  </div>`
}

function changeThreadAndDisplay(art, thread) {
  var threadInfo = api.activeThreads.find(t => t.title == thread)
  if(!threadInfo) 
    return alert(`${thread} is currently inactive`)

  api.uiActions.groupSelected(thread)
  api.changeDisplay(art)
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

  activeThreads.map(thread => {
    var marker = L.marker(thread.coords, {
      title: thread.thread[0],
      icon: L.divIcon({html: buildColoredDotMarker(thread)})
    })
    marker.on('click', L.bind(uiActions.groupSelected, null, thread.title));
    thread.anchorMarker = marker
    layerGroups['anchorPoints'].addLayer(marker)
    // test out showing all markers on home page, put the anchor points on their own layer
  })

  return Array.from(threads)
  .reduce(function(groups, thread) {
    groups[thread] = L.layerGroup()
    return groups
  }, {})
}

var layerGroups = {
  'All': L.layerGroup(),
  'Home': L.layerGroup(),
  'anchorPoints': L.layerGroup(),
}

layerGroups['Home'].addTo(map)

loadMappedArtworks(function(json) {
  api.object_json = json
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
        art.marker = marker
        art.icon = icon
        art.marker.setIcon(art.icon);
        marker.on('click', objectDetail);
        function objectDetail(e) {
          changeDisplay(art, icon)
        }


        markers[art.meta.id] = marker

        layerGroups['All'].addLayer(marker)
        if(art.threads) {
          art.threads.forEach(function(thread) {
            var group = layerGroups[thread] || L.layerGroup()
            group.addLayer(marker)
            if(!layerGroups[thread]) { layerGroups[thread] = group }
            var threadInfo = api.activeThreads.find(t => t.title == thread)
            if(threadInfo) {
              threadInfo.artIds = threadInfo.artIds || []
              threadInfo.artIds.push(art.id)
            }
          })
        }
      }
    })

    var globalMaxBounds = getPaddedBoundsFromLayer(layerGroups['All'], 0.25)
    var nextMove = map._getBoundsCenterZoom(globalMaxBounds)
    map.flyTo(nextMove.center, nextMove.zoom)
    activeThreads.map(function(thread) {
      var layer = api.layerGroups[thread.title]
      L.polyline(
        Object.values(layer._layers).filter(({_latlng}) => _latlng).map(dot => [dot._latlng.lat, dot._latlng.lng]),
        {dashArray: [3, 10], color: api.threadColors[thread.title]}
      ).addTo(layer)

      layerGroups['Home'].addLayer(layer)
    })
  })

})

function getPaddedBoundsFromLayer(layer, pad) {
  if(layer == api.layerGroups["Home"]) {
    // L.geoJson can't deal with a layer of layers, so get all the individual markers
    // from the direct children of this layer
    var previouslyNestedLayers = Object.values(layer._layers).reduce(
      (allLayers, activeThread) =>
        allLayers.concat(Object.values(activeThread._layers)),
      []
    )
    layer = L.layerGroup(previouslyNestedLayers)
  }

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
      console.info('groupSelected', thread)
      api.lastActiveThread = thread
      var group = layerGroups[thread] || L.layerGroup()
      var color = api.threadColors[thread]

      var threadInfo = api.activeThreads.find(t => t.title == thread)
      if(threadInfo) uiActions.updateQuickFacts(threadInfo)

      Object.keys(layerGroups).map(function(layer){
        if (layer == thread){
          map.addLayer(group)
        } else {
          map.removeLayer(layerGroups[layer])
        }
      })
  },
  closeObject : function (fullReset=false) {
    document.querySelector("#object").innerHTML = ""
    if(fullReset) api.uiActions.groupSelected('Home')
    var globalMaxBounds = getPaddedBoundsFromLayer(layerGroups['Home'], 0.25)
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

  },
  updateQuickFacts: function (thread) {
    var randomFact = thread.facts[Math.floor(Math.random()*thread.facts.length)]
    document.querySelector('.left_header').innerHTML = `<p class="factoid">${randomFact}</p>`
  }
}

window.api = {
  map: map,
  markers: markers,
  changePopup: changePopup,
  layerGroups: layerGroups,
  uiActions: uiActions,
  threadColors: {
    'The Silk Road': "#ffff00",
    'Red dye from Mexico':  "#ff3145",
    'Blue & White Ceramics':  "#007aff",
    'Buddhism': "#00ff01",
    'The Triangle Trade': "#00ffff",
    'China Trade': "#ffb400",
    'Islam': "#7956b4",
    'Asian Design in Europe': "#7956b4",
  },
  lastActiveThread: false,
  changeDisplay: changeDisplay,
  changeThreadAndDisplay,
  activeThreads,
}

L.Map.prototype.panToOffset = function (latlng, offset, options) {
  var x = this.latLngToContainerPoint(latlng).x - offset[0]
  var y = this.latLngToContainerPoint(latlng).y - offset[1]
  var point = this.containerPointToLatLng([x, y])
  return this.setView(point, this._zoom, { pan: options })
}

