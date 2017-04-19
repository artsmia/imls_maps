import React from 'react'

import imageUrl from '../util/image-url'

export default class extends React.Component {
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
        <div style={{position: 'fixed', bottom: '1em'}} className="seeRoute">
          <span
            className="showThread"
            onClick={() => this.props.setGlobalState({mapFullscreen: true})}
          >
            ↺ see route
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
        }
        .pagination > div:before {
          content: "\\2190";
          font-size: 3em;
          position: relative;
          top: -1em;
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
          font-size: 3em !important;
          padding: 1em 0.25em;
        }

        .seeRoute span:hover, .seeRoute span:active {
          background-color: rgba(100, 200, 300, 0.2);
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
      setGlobalState: update
    } = this.props
    
    const activeIndex = thread.artworks.indexOf(art)
    const nextIndex = (activeIndex+1)%thread.artworks.length
    const prevIndex = activeIndex == 0 ?
      thread.artworks.length-1 : // wrap around to the last
      (activeIndex-1)%thread.artworks.length
    const nextArt = thread.artworks[nextIndex]
    const prevArt = thread.artworks[prevIndex]

    return <div className="pagination">
      <div
        className="prev"
        onClick={() => update({activeArtwork: prevArt})}
        style={{backgroundImage: `url(${imageUrl(prevArt.id)})`}}
      >
        &larr;
      </div>
      <div
        className="next"
        onClick={() => update({activeArtwork: nextArt})}
        style={{backgroundImage: `url(${imageUrl(nextArt.id)})`}}
      >
        &rarr;
      </div>
    </div>
  }

  quickFacts() {
    const {activeThread: thread} = this.props
    const randomFact = thread.facts[Math.floor(Math.random()*thread.facts.length)]

    return <p>
      {randomFact}
    </p>
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
        style={{cursor: 'pointer', maxWidth: '30%'}}
        onClick={() => update({activeArtwork: art, activeThread: thread})}
        key={'addlThread-'+index}
      >
        <img src={imageUrl(thread.image)} />
        <p>{thread.title}</p>
      </div>
    })

    return additionalThreads.length > 0 && <div>
      <p>See how this related to other routes</p>
      {additionalThreads}
    </div>
  }

}
