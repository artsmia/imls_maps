import React from 'react'
import getConfig from 'next/config'
let L

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
const {mapboxToken} = publicRuntimeConfig
console.log({mapboxToken, env: process.env, publicRuntimeConfig});

export default class extends React.Component {
  render () {
    const {mapWidth, headerHeight} = this.props
    const mapStyle = {
      width: mapWidth,
      height: `${100 - parseInt(headerHeight)}vh`,
      marginTop: `${headerHeight}`,
    }
    console.info({mapStyle})

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
    if(L.mapboxGL == undefined) require('mapbox-gl-leaflet')

    var map = L.map('map', {zoomControl: false, minZoom: 2})
    map.attributionControl.setPrefix('')
    L.control.zoom({position: 'topright'}).addTo(map)

    // var tangramLayer = Tangram.leafletLayer({
    //   scene: 'static/scene.yaml',
    //   attribution: 'Tangram | &copy; OSM contributors'
    // })
    // debugger
    const mapboxLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/kjell/cj1pezubs00142rmr8owg43op/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        attribution: 'Mapbox | &copy; OSM contributors',
        detectRetina: true
      }
    )
    const mapboxQuietLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/kjell/cjdtov9am4gr72so44i194ga8/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        attribution: 'Mapbox | &copy; OSM contributors',
        detectRetina: true
      }
    )
    // TODO use GL map and figure out why the new map style isn't appearing
    const mapboxQuietGL = L.mapboxGL({
      style: 'mapbox://styles/kjell/cjdtov9am4gr72so44i194ga8',
      accessToken: `${mapboxToken}`,
    })
    const mapboxBright = L.mapboxGL({
      style: 'mapbox://styles/mapbox/bright-v8',
      accessToken: `${mapboxToken}`,
    })
    const allLayers = {
      // mapboxOutdoorsQuiet: mapboxQuietLayer,
      // mapboxOutdoors: mapboxLayer,
      mapboxQuietLayer,
      mapboxQuietGL,
      mapboxBright,
      // tangramDefault: tangramLayer,
    }
    const defaultLayer = mapboxQuietLayer
    defaultLayer.addTo(map)

    // const backgroundLayers = L.layerGroup([mapboxLayer])
    if(this.props.debug) {
      const backgroundLayerChooser = L.control.layers(allLayers)
      .setPosition('bottomright')
      .addTo(map)
    }

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
