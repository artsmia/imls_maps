import React from 'react'
let L

export default class extends React.Component {
  render () {
    const {mapWidth, headerHeight} = this.props
    const mapStyle = {
      width: mapWidth,
      height: `${100 - parseInt(headerHeight)}vh`,
    }

    return <div id="map" style={mapStyle}>
      <style jsx>{`
        div#map {
          height: 100vh;
          position: fixed;
        }
      `}</style>
    </div>
  }

  constructor () {
    super()
    this.state = {
      showMap: false,
      mapFullscreen: false
    }
  }

  componentDidMount () {
    if(L == undefined) L = require('leaflet')

    var map = L.map('map', {zoomControl: false, minZoom: 2})
    L.control.zoom({position: 'topright'}).addTo(map)
    var tangramLayer = Tangram.leafletLayer({
      scene: 'static/scene.yaml',
      attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    })
    const mapboxLayer = L.tileLayer(
      'https://api.mapbox.com/styles/v1/kjell/cj1pezubs00142rmr8owg43op/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2plbGwiLCJhIjoicm96TVFucyJ9.AsAmWG_TPyhDhJLEC7hKTw',
      {detectRetina: true}
    )
    mapboxLayer.addTo(map)

    const backgroundLayers = L.layerGroup([mapboxLayer, tangramLayer])
    const backgroundLayerChooser = L.control.layers({
      mapboxOutdoors: mapboxLayer,
      tangramDefault: tangramLayer,
    })
    .setPosition('bottomright')
    .addTo(map)
    map.setView([44.95833, -93.27434], 3)

    this.setState({showMap: true, map})
    this.props.setGlobalState({map})

    if(!L.Control.Fullscreen) require('leaflet-fullscreen')
    new L.Control.Fullscreen({
      position: 'topright',
      pseudoFullscreen: true,
    }).addTo(map)

    map.on('fullscreenchange', () => {
      console.info('map on fullscreenchange')
      this.props.setGlobalState({mapFullscreen: map.isFullscreen()})
    })
  }

  componentWillUpdate(nextProps, nextState) {
    const {map} = nextProps

    var isFull = map.isFullscreen()

    if(!!nextProps.mapFullscreen && !isFull) {
      map.toggleFullscreen({pseudoFullscreen: true})
    }

    if(!nextProps.mapFullscreen && isFull) {
      map.toggleFullscreen({pseudoFullscreen: true})
    }
  }
}
