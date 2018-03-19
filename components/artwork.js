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

    const galleryLocation = art.meta.room.replace('G', '')
    const onView = art.meta.room !== 'Not on View'

    const seeRouteButton = (
      <div
        style={{ position: 'fixed', bottom: 0, padding: '1em' }}
        className="seeRoute iconButton"
      >
        <span
          className="showThread"
          style={{ padding: '1em 0' }}
          onClick={() => this.props.setGlobalState({ mapFullscreen: true })}
        >
          <i style={{ position: 'relative', top: 2, fontStyle: 'normal' }}>↺</i>
          {this.props.showIconLabels && ' back to map'}
        </span>
      </div>
    )

    return <section id="artwork">
      <header style={{ backgroundColor: thread.color }}>
        <h1 style={{ margin: 0, padding: '1rem' }}>{thread.title}</h1>
      </header>
      <div className="right" style={{}}>
        {this.mainContent()}

        {this.addlThreads()}
        {this.relatedArtworks()}
      </div>

      <div className="left">
        <figure>
          <img src={imageUrl(art.id)} />
          <figcaption>
            <p><strong>{art.meta.title.replace(/<\/?I>/g, '')}</strong>, {art.meta.dated}</p>
            <p>
              {art.meta.artist && art.meta.artist.replace('Artist: ', '') ||
                art.meta.culture ||
                art.meta.country && `Unknown, ${art.meta.country}`}
            </p>
            <p>{art.meta.medium}</p>
          </figcaption>

          <div className="location" style={{marginBottom: '3em'}}>
            <p>{onView ? `Located in Gallery ${galleryLocation}` : 'Not on View'}</p>
            {onView && <img src={`https://artsmia.github.io/map/galleries/${galleryLocation}.png`}
              style={{maxWidth: '15em'}} />}
          </div>
        </figure>

        {false && seeRouteButton}
      </div>

      <footer>
        <div style={{backgroundColor: '#eee', padding: '1rem', position: 'relative', minHeight: '5em'}}>
          {this.threadNavigation()}
        </div>
      </footer>

      <style>{`
        #artwork {
          position: absolute;
          top: 0;
          left: calc(100vw - 51rem);
          width: 51rem;
          height: 135vh;
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

        footer {
          position: fixed;
          bottom: 0;
          width: 100%;
        }

        .pagination {
          position: absolute;
          width: 23.4em;
          left: 14%;
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
          top: 0.5em;
          left: -1em;
          color: #232323;
        }
        .pagination > div:nth-child(1) {
          float: left;
          margin-left: 2em;
        }
        .pagination > div:nth-child(2) {
          margin-left: 2em;
          border-radius: 0;
        }
        .pagination > div:nth-child(2):before {
          content: ""
        }
        .pagination > div:nth-child(3) {
          float: right;
          margin-right: 2em;
        }
        .pagination > div:nth-child(3):before {
          content: "\\2192";
          left: 2em;
        }

        .seeRoute span {
          cursor: pointer;
          font-size: 2em !important;
          padding: 1em;
        }

        figure {
          min-height: 60vh;
          margin: 1rem;
        }

        figcaption {
          line-height: 1.5em;
        }
        figcaption p {
          margin: 0;
        }
      `}</style>
    </section>
  }

  relatedArtworks () {
    const {activeArtwork: art} = this.props
    if(art.relateds.length == 0) return <span />

    return <div className={`relateds`}>
      <h3 style={{margin: '2.5em 0 0 0'}}>Related:</h3>
      {art.relateds.map(id => {
        return <a
          href={`#`}
          key={id}
          style={{cursor: 'pointer', maxWidth: '43%', display: 'block'}}
        >
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
      window.scrollTo(0, 0)
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
      <div className="current"
        style={{backgroundImage: `url(${imageUrl(art.id)})`}}
      >(this artwork)</div>
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
        <p style={{borderLeft: `solid ${thread.color}`, borderWidth: '0 0 0 1em', paddingLeft: '0.5em'}}>{thread.title}</p>
      </div>
    })

    return additionalThreads.length > 0 && <div style={{paddingBottom: '7rem'}}>
      <h3 style={{margin: '2.5em 0 0 0'}}>Transfer Routes</h3>
      {additionalThreads}
    </div>
  }
}
