/** @format
 */
import React from 'react'
import { withRouter } from 'next/router'
import Link from 'next/link'

import Map from '../components/map'
import Threads from '../components/threads'
import Artwork from '../components/artwork'
import Header from '../components/header'
import ImageZoom from '../components/image-zoom'
import About from '../components/about'
import { artworkMeta, activeThreads } from '../data'

let showSplashScreenOnFirstLoad = true

class Index extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      map: null,
      showIconLabels: true,
      alwaysAdvanceQuickFacts: false,
      showSplash: showSplashScreenOnFirstLoad,
      fullscreenImage: null,
      artMeta: artworkMeta,
      activeThreads,
      ...props,
    }
  }

  render() {
    const headerHeight =
      this.state.activeThread ||
      this.state.activeArtwork ||
      this.state.showSplash
        ? '0vh'
        : '23vh'

    let propsToPass = {
      setGlobalState: this.setGlobalState.bind(this),
      ...this.state,
      headerHeight,
    }

    var mapWidth = this.state.activeArtwork ? 'calc(100vw - 51rem)' : '71vw'

    const showHomeButton =
      !this.state.fullscreenImage &&
      (this.state.activeArtwork || this.state.activeThread)
    const showAboutButton = !this.state.fullscreenImage && !showHomeButton
    const { showIconLabels } = this.state
    const homeButtonStyles = {
      position: 'fixed',
      bottom: 0,
      marginLeft: showIconLabels ? '-.75em' : '.5em',
      zIndex: 50000000000,
      fontSize: '2rem',
      padding: '1em 0.5em 0.5em 0',
    }
    const homeIconStyles = {
      fontSize: '2.7rem',
      ...(showIconLabels
        ? {
            position: 'relative',
            top: '-0.5em',
            left: '4rem',
          }
        : {}),
    }

    const debug = !!this.props.url.query.debug

    const splashStyles = {
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(25, 25, 25, 0.7)',
      position: 'fixed',
      zIndex: '1000',
      color: 'white',
      textAlign: 'center',
      paddingTop: '15%',
      fontSize: '234%',
      lineHeight: '2.3em',
    }
    const splash = (
      <div
        style={splashStyles}
        onClick={this.handleHideSplashScreen.bind(this)}
      >
        <h1>Explore Mia's Global Collection through World History</h1>
        <p>Please touch screen to begin</p>
      </div>
    )

    const showAboutPopupStyles = {
      border: '1px solid rgba(1, 1, 1, 0.5)',
      width: '80vw',
      // height: '100vh',
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 1000000,
      borderWidth: '6vh 10vw 26vh 10vw',
      fontSize: '2em',
    }

    return (
      <div>
        {this.state.showSplash && splash}
        <Header {...propsToPass} />
        <Map {...propsToPass} mapWidth={mapWidth} debug={debug} />
        {this.state.map && <Threads {...propsToPass} />}
        {this.state.activeArtwork && <Artwork {...propsToPass} />}
        {this.state.activeArtwork && this.state.fullscreenImage && (
          <ImageZoom id={this.state.fullscreenImage} {...propsToPass} />
        )}
        {showHomeButton && (
          <div
            style={homeButtonStyles}
            className="home iconButton"
            onClick={this.handleHomeButton.bind(this)}
          >
            <span className="material-icons" style={homeIconStyles}>
              home
            </span>
            {showIconLabels && 'home'}
          </div>
        )}
        {showAboutButton && (
          <div
            style={homeButtonStyles}
            className="home iconButton"
            onClick={() => this.setState({ showAbout: true })}
          >
            <span className="material-icons" style={homeIconStyles}>
              info
            </span>
            {showIconLabels && 'about'}
          </div>
        )}

        {this.state.showAbout && (
          <div
            style={showAboutPopupStyles}
            onClick={() => this.setState({ showAbout: false })}
          >
            <div
              style={{ background: 'white', margin: 0, padding: '1em' }}
              onClick={(e) => e.stopPropagation()}
            >
              <About />
            </div>
          </div>
        )}

        {this.specialControls()}
      </div>
    )
  }

  setGlobalState(state) {
    // be sure to `.bind` this when passing it to subcomponents,
    // or `.setState` won't be defined
    // …also global state is bad or something. Learn redux
    false &&
      console.info(
        'updating global state with ',
        state,
        'it will look something like ',
        { ...this.state, ...state }
      )
    this.setState && this.setState(state)
    window.state = this.state
  }

  handleHomeButton() {
    this.setState({
      activeArtwork: null,
      activeThread: null,
      mapFullscreen: false,
      fullscreenImage: null,
    })
    this.props.router.push('/')
  }

  handleHideSplashScreen() {
    showSplashScreenOnFirstLoad = false
    this.setState({ showSplash: false })
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      (this.state.activeArtwork && nextState.activeArtwork == null) ||
      (this.state.activeArtwork == null && nextState.activeArtwork) ||
      (this.state.activeThread == null && nextState.activeThread)
    ) {
      setTimeout(() => this.state.map.invalidateSize(), 0)
      this.setState({
        activeArtwork: nextState.activeArtwork,
        activeThread: nextState.activeThread,
      })
    }

    if (this.state.activeArtwork !== nextState.activeArtwork)
      window.scrollTo(0, 0)
  }

  specialControls() {
    const debug = !!this.props.url.query.debug

    if (!debug) return
    const { showIconLabels, alwaysAdvanceQuickFacts } = this.state

    return (
      <div style={{ position: 'absolute', bottom: '1em', right: '1em' }}>
        <button
          onClick={() => this.setState({ showIconLabels: !showIconLabels })}
        >
          {showIconLabels ? 'Hide' : 'Show'} Labels
        </button>
        <button
          onClick={() =>
            this.setState({ alwaysAdvanceQuickFacts: !alwaysAdvanceQuickFacts })
          }
        >
          {alwaysAdvanceQuickFacts ? '' : "Don't"} auto-advance quick facts
        </button>
      </div>
    )
  }
}

export default withRouter(Index)
