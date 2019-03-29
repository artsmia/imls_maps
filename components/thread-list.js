import React from 'react'

// TODO onclick changes active thread
export default class ThreadList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const props = this.props

    const activateThread = (thread) => props.setGlobalState({activeThread: thread})
    const threadBorderColorStyles = props.threads.map((thread, index) => `
      li.thread-${index} { border-left-color: ${thread.color}; }
    `).join('')

    return <ul>
      {props.threads.map((thread, index) => {
        const threadIsActive = props.activeThread == thread 
        const threadElem = <span onClick={activateThread.bind(this, thread)}>
          {thread.title}
        </span>

        return <li className={`thread-${index}`} key={thread.title} style={{opacity: !props.activeThread || threadIsActive ? '1' : '0.5'}}>
          {threadIsActive ?
            <div style={{backgroundColor: 'black'}}>
              <strong style={{color: 'white'}}>{threadElem}</strong>
              <QuickFacts thread={thread} setGlobalState={props.setGlobalState} />
            </div> :
            threadElem
          }
        </li>
      })}
      <style>{`
        ul { 
          display: block;
          width: 100%;
          padding: 0;
          margin: 0;
        }
        li {
          list-style: none;
          font-size: 2em;
          border: 1px solid black;
          border-width: 1px 0 1px 0;
          border-left: 1rem solid transparent;
          cursor: pointer;
        }
        li span {
          display: inline-block;
          padding: 2.5rem 1.75vw;
        }
        ${threadBorderColorStyles}
      `}</style>
    </ul>
  }
}

class QuickFacts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {index: 0}
  }

  render() {
    const {thread} = this.props

    const {index} = this.state
    const activeFact = thread.facts[index]

    const dotSize = '0.1em'
    const dotStyle = {
      backgroundColor: '#aaa',
      borderRadius: '1em',
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      margin: '0 0.05em',
      padding: dotSize,
    }

    const factSelectors = thread.facts.map((fact, index) => {
      return fact == activeFact
        ? <span style={{...dotStyle, backgroundColor: '#232323'}} key={index} />
        : <span
            style={dotStyle}
            onClick={this.changeQuickFact.bind(this, index)}
            key={index}
          />
    })
    const nextFact = this.changeQuickFact.bind(this, index+1)

    const baseUrl = 'https://cdn.dx.artsmia.org/videos/imls_maps/'
    const videoFile = 
      thread.title === 'Buddhism' && 'buddhism_final_8.8.mp4' ||
      thread.title === 'Asian Design and Influence' && 'asianDesign_final_8.8.mp4' ||
      thread.title === 'Blue and White Ceramics' && 'blueWhite_final_8.8.mp4' ||
      thread.title === 'The China Trade' && 'maritime_final_8.8.mp4' ||
      thread.title === 'Red Dye from Mexico' && 'cochineal_final_8.8.mp4' ||
      thread.title === 'The Silk Road' && 'silk_final_8.8.mp4' ||
      thread.title === 'The Silver Trade' && 'silver_final_8.8.mp4'
      || false
    const showVideo = videoFile && `${baseUrl}${videoFile}` 

    const videoWrapperStyles = this.state.videoPlaying ? {
        border: '1px solid rgba(1, 1, 1, 0.5)',
        width: '80vw',
        height: 'calc(100vh - 20vw)',
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 1000000,
        borderWidth: '10vh 10vw 26vh 10vw',
    } : {}

    const activateFirstArtwork = () => this.props.setGlobalState({activeArtwork: thread.artworks[0]})

    return <div style={{backgroundColor: 'white', padding: '0.5em'}}>
      <h4 style={{display: 'inline-block', paddingRight: '0.5em', marginBottom: 0, marginTop: 0}}>Quick Facts</h4> 
      <p style={{marginBottom: 0, fontFamily: 'MiaGrotesk-Light'}} onTouchEnd={nextFact}>
        {activeFact} 
      </p>
      <div style={{paddingTop: '0.5em'}}>
        {factSelectors}
        <a style={{color: 'red', marginLeft: '1em'}} onClick={nextFact}>See next &rarr;</a>
      </div>
      <p onClick={activateFirstArtwork}>Select an artwork on the map to begin.</p>

      {showVideo && <div style={videoWrapperStyles} onClick={this.stopVideo.bind(this)}>
        {this.state.videoPlaying && <div><span style={{
          position: 'absolute',
          top: '-8vh',
          fontSize: '3em',
          left: '-8vw',
        }}>&times;</span>
        <span style={{
          position: 'absolute',
          bottom: '-14vh',
          right: 0,
          width: '33px',
          height: '33px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          zIndex: 10000,
        }} onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}></span>
        </div>}
        <video
          ref="video"
          controls
          style={{maxWidth: '100%'}}
          src={showVideo}
          poster={`${showVideo}.jpg`}
          preload="true"
          onClick={(e) => {
            e.target.play()
            e.preventDefault()
            e.stopPropagation()
          }}
          onPlay={() => this.setState({videoPlaying: true})}
          onEnded={() => this.setState({videoPlaying: false})}
        />
        <style>{`
          video::-webkit-media-controls-mute-button, video::-webkit-media-controls-fullscreen-button
          {
            display: none;
            visibility: hidden;
          }

          video::-webkit-media-controls-volume-slider {
            display: none;
            visibility: hidden;
          }
          
          video::-media-controls-download-button {
            display: none;
            visibility: hidden;
          }


          /* video::-webkit-media-controls-enclosure { border: 1px solid pink } */
        `}</style>
      </div>}
    </div>
  }

  stopVideo(event) {
    this.refs.video.pause()
    this.setState({videoPlaying: false})
  }

  changeQuickFact(index) {
    const {thread} = this.props

    this.setState({
      index: index % thread.facts.length,
    })
  }
}
