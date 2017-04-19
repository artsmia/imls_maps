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
      '23vh'

    let propsToPass = {
      setGlobalState: this.setGlobalState.bind(this),
      ...this.state,
      headerHeight,
    }

    var mapWidth = this.state.activeArtwork ? 'calc(100vw - 39rem)' : '71vw'

    const showHomeButton = this.state.activeArtwork || this.state.activeThread
    const homeButtonStyles = {
      position: 'fixed',
      bottom: '1rem',
      left: '-1.5em',
      zIndex: 50000000000,
      fontSize: '2em',
    }
    const homeIconStyles = {
      fontSize: '2em',
      position: 'relative',
      top: '-0.25em',
      left: '1.25em',
    }

    return (
      <div>
        <Header {...propsToPass} />
        <Map {...propsToPass} mapWidth={mapWidth} />
        {this.state.map && <Threads {...propsToPass} />}
        {this.state.activeArtwork && <Artwork {...propsToPass} />}
        {showHomeButton && <div
          style={homeButtonStyles}
          className="home"
          onClick={() => this.setState({
            activeArtwork: null,
            activeThread: null,
            mapFullscreen: false
          })}
        >
          <span className="material-icons" style={homeIconStyles}>home</span> see all
        </div>}
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

  componentWillUpdate (nextProps, nextState) {
    if(this.state.activeArtwork && nextState.activeArtwork == null ||
       this.state.activeArtwork == null && nextState.activeArtwork ||
       this.state.activeThread == null && nextState.activeThread) {
      setTimeout(() => this.state.map.invalidateSize(), 0)
    }
  }
}
