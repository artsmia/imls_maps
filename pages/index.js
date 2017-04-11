import React from 'react'

import Map from '../components/map'
import Threads from '../components/threads'
import Artwork from '../components/artwork'

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
    let propsToPass = {
      setGlobalState: this.setGlobalState.bind(this),
      ...this.state,
    }

    var mapWidth = this.state.activeArtwork ? '55vw' : '71vw'

    return (
      <div>
        <Map {...propsToPass} mapWidth={mapWidth} />
        {this.state.map && <Threads {...propsToPass} />}
        {this.state.activeArtwork && <Artwork {...propsToPass} />}
        <span
          style={{position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 500, fontSize: '4em'}}
          className="home"
          onClick={() => this.setGlobalState({activeArtwork: null, activeThread: null})}
        >
          🏠 ⌂
        </span>
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
