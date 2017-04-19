import React from 'react'

import Map from '../components/map'
import Threads from '../components/threads'
import Artwork from '../components/artwork'
import Header from '../components/header'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      map: null,
    }
  }

  static async getInitialProps ({req}) {
    return {}
  }

  render () {
    const headerHeight = this.state.activeThread || this.state.activeArtwork ?
      '0vh' :
      '13vh'

    let propsToPass = {
      setGlobalState: this.setGlobalState.bind(this),
      ...this.state,
      headerHeight,
    }

    var mapWidth = this.state.activeArtwork ? '55vw' : '71vw'

    return (
      <div>
        <Header {...propsToPass} />
        <Map {...propsToPass} mapWidth={mapWidth} />
        {this.state.map && <Threads {...propsToPass} />}
        {this.state.activeArtwork && <Artwork {...propsToPass} />}
        <div
          style={{position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 50000000000, fontSize: '3em'}}
          className="home"
          onClick={() => this.setState({
            activeArtwork: null,
            activeThread: null,
            mapFullscreen: false
          })}
        >
          <span className="material-icons" style={{fontSize: '2em'}}>home</span> see all
        </div>
      </div>
    )
  }

  setGlobalState (state) {
    // be sure to `.bind` this when passing it to subcomponents,
    // or `.setState` won't be defined
    // …also global state is bad or something. Learn redux
    console.info(
      'updating global state with ',
      state,
      'it will look something like ',
      {...this.state, ...state}
    )
    this.setState && this.setState(state)
    window.state = this.state
  }
}
