import React from 'react'
let L
import paddedBoundsFromLayer from '../util/map/padded-bounds-from-layer'
import imageUrl from '../util/image-url'

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

  componentWillMount() {
    L = require('leaflet')
    const layerGroups = this.threadsToLayerGroupsWithPolyline()
    this.setState({layerGroups})
  }

  componentDidMount () {
    const {map} = this.props
    const {layerGroups} = this.state
    layerGroups.map(g => g.addTo(map))
    centerPaddedBounds(layerGroups, map)
  }

  componentWillUpdate (nextProps, nextState) {
    this.updateActiveMapLayers(nextProps, nextState)
  }

  threadsToLayerGroups (callback) {
    let {threads} = this.props

    return threads.map(thread => {
      let g = L.layerGroup(
        thread.artworks
        .map(art => artToMarker(art, thread, this.artworkClicked.bind(this, art, thread)))
      )
      callback && callback(g, thread)
      thread.layerGroup = g
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
    this.props.setGlobalState({
      activeArtwork: art,
      activeThread: thread,
      mapFullscreen: false
    })
  }

  updateActiveMapLayers (props, state) {
    const {map, activeArtwork, activeThread, activeThreads} = props

    if(activeThread) {
      activeThreads.forEach(thread => {
        const group = thread.layerGroup
        if(activeThread === thread) {
          map.hasLayer(group) || map.addLayer(group)
          centerPaddedBounds(group, map)
        } else {
          map.removeLayer(group)
        }
      })
    } else {
      activeThreads.forEach(thread => {
        const group = thread.layerGroup
        map.hasLayer(group) || map.addLayer(group)
      })
    }

    if(activeArtwork) {
      activeArtwork.marker.setIcon(activeArtwork.imageIcon)
      map.panTo(activeArtwork.marker._latlng)
    }

    if(!activeArtwork && !activeThread && this.state) {
      const {layerGroups} = this.state
      const {map} = this.props
      centerPaddedBounds(layerGroups, map, L)
    }
  }
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

  const m = L.marker(art.coords.slice().reverse(), {
    title: art.meta.title,
    icon: imageIcon
  })
  m.on('click', onClick)
  art.marker = m
  return m
}

function centerPaddedBounds(layers, map) {
  var nextMove = map._getBoundsCenterZoom(
    paddedBoundsFromLayer(layers, 0.1, L)
  )
  map.flyTo(nextMove.center, nextMove.zoom)
}
