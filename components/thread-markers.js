/** @format */

import React from 'react'
let L
import paddedBoundsFromLayer from '../util/map/padded-bounds-from-layer'
import imageUrl from '../util/image-url'

export default class extends React.Component {
  render() {
    return (
      <style>{`
      .leaflet-div-icon {
        background: none !important;
        border: none !important;
      }
      .leaflet-div-icon span {
        width: 1.3em;
        height: 1.3em;
        display: block;
        border-radius: 1em;
        border: 3px solid gold;
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
    )
  }

  componentWillMount() {
    L = require('leaflet')
    const layerGroups = this.threadsToLayerGroupsWithPolyline()
    this.setState({ layerGroups })
  }

  componentDidMount() {
    const { map } = this.props
    const { layerGroups } = this.state
    layerGroups.map((g) => g.addTo(map))
    centerPaddedBounds(layerGroups, map)

    this.updateActiveMapLayers(this.props, this.state)
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateActiveMapLayers(nextProps, nextState)
  }

  threadsToLayerGroups(callback) {
    let { threads } = this.props

    return threads.map((thread) => {
      let g = L.layerGroup(
        thread.artworks.map((art) =>
          artToMarker(art, thread, this.artworkClicked.bind(this, art, thread))
        )
      )
      callback && callback(g, thread)
      thread.layerGroup = g
      return g
    })
  }

  threadsToLayerGroupsWithPolyline() {
    const values = Object.values
    return this.threadsToLayerGroups((group, thread) => {
      const loopedLayers = values(group._layers).concat(
        values(group._layers)[0]
      )
      const latLngs = loopedLayers
        .filter((dot) => dot && dot._latlng)
        .map((dot) => values(dot._latlng))

      // Don't show lines between artwork badges if we're passing that in the URL
      if (window.location.search.match(/noLines/)) return

      const line = L.polyline(latLngs, {
        dashArray: [7, 10],
        color: thread.color,
      })
      const lineOutlineBlack = L.polyline(latLngs, {
        dashArray: [7, 10],
        color: '#232323',
        strokeWidth: '1',
      })
      group.addLayer(lineOutlineBlack)
      group.addLayer(line)
    })
  }

  artworkClicked(art, thread) {
    this.props.setGlobalState({
      activeArtwork: art,
      activeThread: thread,
      mapFullscreen: false,
    })
  }

  updateActiveMapLayers(props, state) {
    const { map, activeArtwork, activeThread, activeThreads } = props

    if (activeThread) {
      activeThreads.forEach((thread) => {
        const group = thread.layerGroup
        if (activeThread === thread) {
          map.hasLayer(group) || map.addLayer(group)
          centerPaddedBounds(group, map)
        } else {
          map.removeLayer(group)
        }
      })
    } else {
      activeThreads.forEach((thread) => {
        const group = thread.layerGroup
        map.hasLayer(group) || map.addLayer(group)
      })
    }

    if (activeArtwork) {
      activeArtwork.marker.setIcon(activeArtwork.imageIcon)
      // map.panTo(activeArtwork.marker._latlng)

      map.flyTo(activeArtwork.marker._latlng, 7)
    }

    if (!activeArtwork && !activeThread && this.state) {
      const { layerGroups } = this.state
      const { map } = this.props
      centerPaddedBounds(layerGroups, map, L)
    }
  }
}

function artToMarker(art, thread, onClick) {
  const imageIcon = L.divIcon({
    html: `<span class="imageMarker" style="background-image: url(${imageUrl(
      art.id,
      true
    )}); border-color: ${thread.color};"></span>`,
  })
  const dotIcon = L.divIcon({
    html: `<span style='background-color: ${
      thread.color || 'purple'
    };'></span>`,
  })

  art.imageIcon = imageIcon
  art.dotIcon = dotIcon

  // handle spreadsheet to markdown to json conversion gone wrong -
  // the lat and long sometimes get concatted into a comma separated string
  // instead of percolating as [lat, lng]
  let coords =
    art.coords.length === 1
      ? art.coords[0].split(',')
      : art.coords.slice().reverse()

  const m = L.marker(coords, {
    title: art.meta.title,
    icon: imageIcon,
  })
  m.on('click', onClick)
  art.marker = m
  return m
}

function centerPaddedBounds(layers, map) {
  const nextBounds = paddedBoundsFromLayer(layers, 0.1, L)
  if (nextBounds) {
    var nextMove = map._getBoundsCenterZoom(nextBounds)
    map.flyTo(nextMove.center, nextMove.zoom)
  }
}
