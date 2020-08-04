/** @format
 */
import React from 'react'
import 'isomorphic-fetch'

export default class extends React.Component {
  constructor(props) {
    super(props)

    const artMeta = this.props.artMeta.find(
      (meta) => parseInt(meta.id) === parseInt(this.props.id)
    )

    this.state = {
      artMeta,
      id: `map-${this.props.id}`,
    }
  }

  componentDidMount() {
    const artMeta = this.state.artMeta
    const { id, image, image_width, image_height, image_copyright } = artMeta

    if (L.tileLayer.iiif == undefined) require('leaflet-iiif')

    let map = L.map(this.state.id, { zoomControl: false, zoomSnap: 0 })
    new L.Control.Zoom({ position: 'bottomleft' }).addTo(map)
    map.attributionControl.setPrefix('')
    map.setView([0, 0], 0)

    this.tiles = L.tileLayer.iiif(
      `https://iiif.dx.artsmia.org/${id}.jpg/info.json`,
      {
        id: id,
        fitBounds: true,
        setMaxBounds: true,
        // tileSize: 512,
        attribution: image_copyright ? decodeURIComponent(image_copyright) : '',
      }
    )

    this.tiles.addTo(map)
    this.tiles.on('load', (event) => {
      if (this.map.getMinZoom() > 0) return
      // don't let the zoomed image get tiny
      const minZoom = this.map.getZoom() - 0.1
      console.info('set minZoom', minZoom)
      this.map.setMinZoom(minZoom)
      // TODO - reset minZoom when window is resized
      // …and when fullscreen changes?
    })
    window.tiles = this.tiles

    this.map = window.map = map
  }

  render() {
    const { mapWidth, headerHeight } = this.props
    const mapStyle = {
      width: mapWidth,
      height: `${100 - parseInt(headerHeight)}vh`,
      marginTop: `${headerHeight}`,
    }

    const id = this.state.id

    return (
      <div id={id} style={mapStyle}>
        <style jsx>{`
          div#${id} {
            height: 100vh;
            position: fixed;
            width: 100%;
            z-index: 1000000;
            background-color: gainsboro;
          }

          button {
            position: fixed;
            left: 5em;
            bottom: 1em;
            border: 3px solid;
            padding: 0.3em;
            z-index: 100000;
          }

          button:hover,
          button:active,
          button:focus {
            color: white;
            background-color: black;
            border-color: white;
          }
        `}</style>

        <button
          onClick={() => this.props.setGlobalState({ fullscreenImage: null })}
        >
          close
        </button>
      </div>
    )
  }
}
