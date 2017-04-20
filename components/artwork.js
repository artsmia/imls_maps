import React from 'react'

import imageUrl from '../util/image-url'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      clicks: 0,
      quickFactIndex: -1,
    }
  }

  render () {
    const {activeArtwork: art, activeThread: thread} = this.props

    return <section id="artwork">
      <div className="right">
        <header><h1>{thread.title}</h1></header>

        {this.quickFacts()}
        {this.mainContent()}

        {this.relatedArtworks()}
        {this.addlThreads()}
      </div>

      <div className="left">
        <figure>
          <img src={imageUrl(art.id)} />
          <figcaption>
            <p><strong>{art.meta.title}</strong>, {art.meta.dated}</p>
            <p>
              {art.meta.artist && art.meta.artist.replace('Artist: ', '') ||
                art.meta.culture ||
                art.meta.country && `Unknown, ${art.meta.country}`}
            </p>
            <p>{art.meta.medium}</p>
          </figcaption>
        </figure>

        {this.threadNavigation()}
        <div style={{position: 'fixed', bottom: 0, padding: '1em'}} className="seeRoute iconButton">
          <span
            className="showThread"
            style={{padding: '1em 0'}}
            onClick={() => this.props.setGlobalState({mapFullscreen: true})}
          >
            <i style={{position: 'relative', top: 2, fontStyle: 'normal'}}>↺</i>
            {this.props.showIconLabels && ' see route'}
          </span>
        </div>
      </div>

      <style>{`
        #artwork {
          position: absolute;
          top: 0;
          left: calc(100vw - 39rem);
          width: 39rem;
          height: 100%;
          background: white;
        }

        .left, .right {
          width: 41%;
        }

        .left {
          float: left;
        }

        .right {
          width: 54%;
          float: right;
          margin-right: 1.5em;
        }

        img {
          width: 100%;
        }

        .pagination {
          margin-top: 5em;
        }
        .pagination > div {
          width: 5em;
          height: 5em;
          border-radius: 3em;
          display: inline-block;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          color: transparent;
        }
        .pagination > div:before {
          content: "\\2190";
          font-size: 3em;
          position: relative;
          top: -1em;
          color: #232323;
        }
        .pagination > div {
          float: left;
          margin-left: 2em;
        }
        .pagination > div + div {
          float: right;
          margin: 0 2em 0 0;
        }
        .pagination > div + div:before {
          content: "\\2192";
          left: 0.65em;
        }

        .seeRoute span {
          cursor: pointer;
          font-size: 2em !important;
          padding: 1em;
        }

        figure {
          min-height: 60vh;
        }

        figcaption p {
          margin-bottom: 0
        }
        figcaption p + p {
          margin: 0
        }
      `}</style>
    </section>
  }

  relatedArtworks () {
    const {activeArtwork: art} = this.props

    return <div className={`relateds`}>
      {art.relateds.map(id => {
        <a href={`https://artsmia.org/art/${id}`}>
          <img src={imageUrl(id)} />
        </a>
      })}
    </div>
  }

  threadNavigation () {
    const {
      activeThread: thread,
      activeArtwork: art,
      setGlobalState,
    } = this.props
    
    const activeIndex = thread.artworks.indexOf(art)
    const nextIndex = (activeIndex+1)%thread.artworks.length
    const prevIndex = activeIndex == 0 ?
      thread.artworks.length-1 : // wrap around to the last
      (activeIndex-1)%thread.artworks.length
    const nextArt = thread.artworks[nextIndex]
    const prevArt = thread.artworks[prevIndex]
    const nextLabel = "next artwork →"
    const prevLabel = "← previous artwork"

    const updateFn = art => {
      const nextClicks = this.state.clicks + 1
      setGlobalState({activeArtwork: art})
      this.setState({clicks: nextClicks})
    }

    return <div className="pagination">
      <div
        className="prev"
        onClick={updateFn.bind(this, prevArt)}
        style={{backgroundImage: `url(${imageUrl(prevArt.id)})`}}
        title={prevLabel}
      >
        {prevLabel}
      </div>
      <div
        className="next"
        onClick={updateFn.bind(this, nextArt)}
        style={{backgroundImage: `url(${imageUrl(nextArt.id)})`}}
        title={nextLabel}
      >
        {nextLabel}
      </div>
    </div>
  }

  quickFacts() {
    const {activeThread: thread, activeArtwork: art} = this.props
    const artIndex = thread.artworks.indexOf(art)

    const advanceAutomatically = this.state && !this.state.advancedManually || true
    const index = this.state && this.state.quickFactIndex > -1
      ? this.state.quickFactIndex
      : advanceAutomatically && this.state.clicks % thread.facts.length
    const activeFact = thread.facts[index]

    const dotStyle = {
      backgroundColor: '#eee',
      borderRadius: '1em',
      display: 'inline-block',
      width: '0.5em',
      height: '0.5em',
      margin: '0 0.25em'
    }
    const factSelectors = thread.facts.map((fact, index) => {
      return fact == activeFact
        ? <span style={{...dotStyle, backgroundColor: '#232323'}} />
        : <span
            style={dotStyle}
            onClick={this.changeQuickFact.bind(this, index)}
          />
    })

    return <div>
      <h3 style={{display: 'inline-block', paddingRight: '0.5em', marginBottom: 0}}>About this Route</h3> 
      {factSelectors}
      <p style={{marginBottom: 0}}>{activeFact}</p>
    </div>
  }

  changeQuickFact(index) {
    this.setState({
      quickFactIndex: index,
      advancedManually: true,
    })
  }

  mainContent() {
    const {
      activeArtwork: art,
      activeThread: thread,
    } = this.props

    var _content = art.__content.trim().split("\n\n")
    var needle = _content.findIndex(string => string.indexOf(thread.title) > -1)
    var heading = _content[needle+1].replace(/###* /, '')
    var content = _content.splice(needle+2).join("\n\n")
    if(_content.findIndex(string => string.indexOf('* * *') > -1)) content = content.split('* * *')[0]
    if(needle == -1) heading += ' [CONTENT NEEDED?]'

    return <div>
      <h2>{heading}</h2>
      <div>{content}</div>
    </div>
  }
   
  addlThreads() {
    const {
      activeArtwork: art,
      activeThread: thread,
      activeThreads: threads,
      setGlobalState: update,
    } = this.props

    const additionalThreads = art.threads
    .map(threadName => Object.values(threads).find(t => t.thread[0] == threadName)) // TODO update `art.threads` from ['thread name'], to [{thread: '...'}]? see also components/threads.js
    .filter(t => t && t !== thread)
    .map((thread, index) => {
      return <div
        style={{cursor: 'pointer', maxWidth: '43%'}}
        onClick={() => update({activeArtwork: art, activeThread: thread})}
        key={'addlThread-'+index}
      >
        <img src={imageUrl(thread.image)} style={{border: '1px solid #232323'}} />
        <p style={{marginTop: '-.5em'}}>{thread.title}</p>
      </div>
    })

    return additionalThreads.length > 0 && <div>
      <h3 style={{margin: '2.5em 0 0 0'}}>See how this is related to other routes</h3>
      {additionalThreads}
    </div>
  }
}
