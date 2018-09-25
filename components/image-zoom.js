/** @format
 */
import React from 'react'
import 'isomorphic-fetch'

export default class extends React.Component {
  constructor(props) {
    super(props)

    const artMeta = this.props.artMeta.hits.hits.find(
      meta => parseInt(meta._id) === parseInt(this.props.id)
    )._source

    this.state = {
      artMeta,
      id: `map-${this.props.id}`,
    }
  }

  componentDidMount() {
    const artMeta = this.state.artMeta
    const { id, image, image_width, image_height, image_copyright } = artMeta

    if (L.museumTileLayer == undefined) require('../museumTileLayer')

    let map = L.map(this.state.id, { zoomControl: false, zoomSnap: 0 })
    new L.Control.Zoom({ position: 'bottomleft' }).addTo(map)
    map.attributionControl.setPrefix('')
    map.setView([0, 0], 0)

    fetch(`https://tiles.dx.artsmia.org/${id}.json`)
      .then(res => res.json())
      .then(tileJson => {
        this.tiles = L.museumTileLayer(
          'https://{s}.tiles.dx.artsmia.org/{id}/{z}/{x}/{y}.jpg',
          {
            attribution: image_copyright
              ? decodeURIComponent(image_copyright)
              : '',
            id: id,
            width: image_width,
            height: image_height,
            tileSize: tileJson.tileSize || 256,
            fill: true,
          }
        )

        this.tiles.addTo(map)
        window.tiles = this.tiles
        const z1 = this.tiles.options.minZoom + 0.5
        map.setView([0, 0], z1)
        map.setZoom(z1)
      })

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
