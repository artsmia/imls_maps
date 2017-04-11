import React from 'react'
let L
import paddedBoundsFromLayer from '../util/map/padded-bounds-from-layer'

export default class extends React.Component {
  render () {
    return <style>{`
      .leaflet-div-icon {
        background: none !important;
        border: none !important;
      }
      .leaflet-div-icon span {
        width: 1.3em;
        height: 1.3em;
        display: block;
        border-radius: 1em;
      }
      .leaflet-div-icon span.imageMarker {
        width: 5em;
        height: 5em;
        display: block;
        border-radius: 3em;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
    `}</style>
  }

  constructor () {
    super()
  }

  componentDidMount () {
    L = require('leaflet')
    const {map} = this.props
    const layerGroups = this.threadsToLayerGroupsWithPolyline()
    layerGroups.map(g => g.addTo(map))
    var nextMove = map._getBoundsCenterZoom(
      paddedBoundsFromLayer(layerGroups, 0.25, L)
    )
    map.flyTo(nextMove.center, nextMove.zoom)
  }

  threadsToLayerGroups (callback) {
    let {threads} = this.props
    return threads.map(thread => {
      let g = L.layerGroup(
        thread.artworks
        .map(art => artToMarker(art, thread, this.artworkClicked.bind(this, art, thread)))
      )
      callback && callback(g, thread)
      return g
    })
  }

  threadsToLayerGroupsWithPolyline () {
    const values = Object.values
    return this.threadsToLayerGroups((group, thread) => {
      const line = L.polyline(
        values(group._layers).map(dot => values(dot._latlng)),
        {dashArray: [3, 10], color: thread.color}
      )
      group.addLayer(line)
    })
  }

  artworkClicked (art, thread) {
    console.info('artwork clicked', art, thread)
  }
}

function imageUrl(id) {
  return "http://"+id%7+".api.artsmia.org/"+id+".jpg"
}

function artToMarker(art, thread, onClick) {
  const imageIcon = L.divIcon({
    html: `<span class="imageMarker" style="background-image: url(${imageUrl(art.id)})"></span>`
  })
  const dotIcon = L.divIcon({
    html: `<span style='background-color: ${thread.color || 'purple'};'></span>`
  })

  art.imageIcon = imageIcon
  art.dotIcon = dotIcon

  const m = L.marker(art.coords.reverse(), {
    title: art.meta.title,
    icon: dotIcon
  })
  m.on('click', onClick)
  return m
}
