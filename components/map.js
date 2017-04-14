import React from 'react'
let L

export default class extends React.Component {
  render () {
    return <div id="map" style={{width: this.props.mapWidth}}>
      <style jsx>{`
        div#map {
          height: 100vh;
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
    var layer = Tangram.leafletLayer({
      scene: 'static/scene.yaml',
      attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    })
    layer.addTo(map)

    map.setView([44.95833, -93.27434], 3)
    this.setState({showMap: true, map})
    this.props.setGlobalState({map})

    if(!L.Control.Fullscreen) require('leaflet-fullscreen')
    new L.Control.Fullscreen({
      position: 'topright',
      pseudoFullscreen: true,
    }).addTo(map)
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
