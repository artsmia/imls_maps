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
      showIconLabels: true,
      alwaysAdvanceQuickFacts: false,
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

    var mapWidth = this.state.activeArtwork ? 'calc(100vw - 51rem)' : '71vw'

    const showHomeButton = this.state.activeArtwork || this.state.activeThread
    const {showIconLabels} = this.state
    const homeButtonStyles = {
      position: 'fixed',
      bottom: 0,
      marginLeft: showIconLabels ? '-.75em' : '.5em',
      zIndex: 50000000000,
      fontSize: '2rem',
      padding: '1em 0.5em 0.5em 0',
    }
    const homeIconStyles = {
      fontSize: '3rem',
      ...(showIconLabels ? {
        position: 'relative',
        top: '-0.5em',
        left: '4rem',
      } : {})
    }

    return (
      <div>
        <Header {...propsToPass} />
        <Map {...propsToPass} mapWidth={mapWidth} />
        {this.state.map && <Threads {...propsToPass} />}
        {this.state.activeArtwork && <Artwork {...propsToPass} />}
        {showHomeButton && <div
          style={homeButtonStyles}
          className="home iconButton"
          onClick={() => this.setState({
            activeArtwork: null,
            activeThread: null,
            mapFullscreen: false
          })}
        >
          <span className="material-icons" style={homeIconStyles}>home</span>
          {showIconLabels && 'see all'}
        </div>}

        {this.specialControls()}
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

  specialControls () {
    const {showIconLabels, alwaysAdvanceQuickFacts} = this.state

    return <div style={{position: 'absolute', bottom: '1em', right: '1em'}}>
      <button
        onClick={() => this.setState({showIconLabels: !showIconLabels})}
      >{showIconLabels ? 'Hide' : 'Show'} Labels</button>
      <button
        onClick={() => this.setState({alwaysAdvanceQuickFacts: !alwaysAdvanceQuickFacts})}
      >{alwaysAdvanceQuickFacts ? '' : 'Don\'t'} auto-advance quick facts</button>
    </div>
  }
}