/** @format */

import React from 'react'
import { withRouter } from 'next/router'

import imageUrl from '../util/image-url'

class Artwork extends React.Component {
  constructor() {
    super()
    this.state = {
      clicks: 0,
      quickFactIndex: -1,
    }
  }

  render() {
    const { activeArtwork: art, activeThread: thread } = this.props

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

    return (
      <section id="artwork">
        <header
          style={{
            backgroundColor: '#232323',
            color: 'white',
            borderLeft: `1em solid ${thread.color}`,
          }}
          onClick={() => this.update({ activeArtwork: null })}
        >
          <h1 style={{ margin: 0, padding: '1rem' }}>{thread.title}</h1>
        </header>
        <div className="right" style={{}}>
          {this.mainContent()}

          {this.addlThreads()}
          {this.relatedArtworks()}
        </div>

        <div className="left">
          <figure>
            <img
              src={imageUrl(art.id)}
              onClick={() =>
                this.props.setGlobalState({ fullscreenImage: art.id })
              }
            />
            <figcaption>
              <h4 style={{ margin: 0 }}>
                {art.meta.title.replace(/<\/?I>/g, '')}
              </h4>
              <p>{art.meta.dated}</p>
              <p>
                {(art.meta.artist && art.meta.artist.replace('Artist: ', '')) ||
                  art.meta.culture ||
                  (art.meta.country && `Unknown`)}
              </p>
              {art.meta.country && <p>Made in {art.meta.country}</p>}
              <p>{art.meta.medium}</p>
            </figcaption>

            <div className="location" style={{ marginBottom: '3em' }}>
              <p>
                {onView
                  ? `Located in Gallery ${galleryLocation}`
                  : 'Not on View'}
              </p>
              {onView && (
                <img
                  src={`https://artsmia.github.io/map/galleries/${galleryLocation}.png`}
                  style={{ maxWidth: '15em' }}
                />
              )}
            </div>
          </figure>

          {false && seeRouteButton}
        </div>

        <footer>
          <div
            style={{
              backgroundColor: '#eee',
              padding: '1rem',
              position: 'relative',
              minHeight: '5em',
            }}
          >
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
    )
  }

  relatedArtworks() {
    const { activeArtwork: art } = this.props
    if (art.relateds.length == 0) return <span />

    return (
      <div className={`relateds`}>
        <h3 style={{ margin: '2.5em 0 0 0' }}>Related:</h3>
        {art.relateds.map((id, index) => {
          const caption = index === 0 ? art.relatedCaption : art.relatedCaption2
          console.info('caption', { caption, art })

          return (
            <figure style={{ display: 'flex' }}>
              <a
                href={`#`}
                key={id}
                onClick={() =>
                  this.props.setGlobalState({ fullscreenImage: id })
                }
                style={{
                  cursor: 'pointer',
                  flex: '2 0 0',
                  marginRight: '10px',
                }}
              >
                <img src={imageUrl(id)} />
              </a>
              <figcaption style={{ flex: '1 0 0' }}>{caption}</figcaption>
            </figure>
          )
        })}
      </div>
    )
  }

  threadNavigation() {
    const { activeThread: thread, activeArtwork: art } = this.props

    const activeIndex = thread.artworks.indexOf(art)
    const nextIndex = (activeIndex + 1) % thread.artworks.length
    const prevIndex =
      activeIndex == 0
        ? thread.artworks.length - 1 // wrap around to the last
        : (activeIndex - 1) % thread.artworks.length
    const nextArt = thread.artworks[nextIndex]
    const prevArt = thread.artworks[prevIndex]
    const nextLabel = 'next artwork →'
    const prevLabel = '← previous artwork'

    const updateFn = (art) => {
      const nextClicks = this.state.clicks + 1
      this.update({ activeArtwork: art })
      window.scrollTo(0, 0)
      this.setState({ clicks: nextClicks })
    }

    return (
      <div className="pagination">
        <div
          className="prev"
          onClick={updateFn.bind(this, prevArt)}
          style={{ backgroundImage: `url(${imageUrl(prevArt.id, true)})` }}
          title={prevLabel}
        >
          {prevLabel}
        </div>
        <div
          className="current"
          style={{ backgroundImage: `url(${imageUrl(art.id, true)})` }}
        >
          (this artwork)
        </div>
        <div
          className="next"
          onClick={updateFn.bind(this, nextArt)}
          style={{ backgroundImage: `url(${imageUrl(nextArt.id, true)})` }}
          title={nextLabel}
        >
          {nextLabel}
        </div>
      </div>
    )
  }

  mainContent() {
    const { activeArtwork: art, activeThread: thread } = this.props

    var _content = art.__content.trim().split('\n\n')
    var needle = _content.findIndex(
      (string) => string.indexOf(thread.title) > -1
    )
    var heading = _content[needle + 1].replace(/###* /, '')
    var content = _content.splice(needle + 2).join('\n\n')
    if (_content.findIndex((string) => string.indexOf('* * *') > -1))
      content = content.split('* * *')[0]
    if (needle == -1) heading += ' [CONTENT NEEDED?]'

    const fontSize =
      content.length > 500 ? '1.3em' : content.length > 400 ? '1.5em' : '1.7em'
    // adapt font size according to how much content there is, so the words take up approx
    // the same about of page real estate with maximum readability.
    // TODO should the line spacing change with text size?
    console.info('resize font according to content length', content.length, {
      fontSize,
    })

    return (
      <div>
        <h2 style={{ fontSize: '1.7em', marginBottom: '5px' }}>{heading}</h2>
        <div style={{ fontSize }}>{content}</div>
      </div>
    )
  }

  addlThreads() {
    const {
      activeArtwork: art,
      activeThread: thread,
      activeThreads: threads,
    } = this.props

    const additionalThreads = art.threads
      .map((threadName) =>
        Object.values(threads).find((t) => t.thread[0] == threadName)
      ) // TODO update `art.threads` from ['thread name'], to [{thread: '...'}]? see also components/threads.js
      .filter((t) => t && t !== thread)
      .map((thread, index) => {
        return (
          <div
            style={{ cursor: 'pointer', maxWidth: '55%' }}
            onClick={() =>
              this.update({ activeArtwork: art, activeThread: thread })
            }
            key={'addlThread-' + index}
          >
            <p
              style={{
                borderLeft: `1em solid ${thread.color}`,
                paddingLeft: '0.5em',
              }}
            >
              {thread.title}
            </p>
          </div>
        )
      })

    return (
      additionalThreads.length > 0 && (
        <div style={{ paddingBottom: '7rem' }}>
          <h3 style={{ margin: '2.5em 0 0 0' }}>Transfer Routes</h3>
          {additionalThreads}
        </div>
      )
    )
  }

  update(newProps) {
    const { setGlobalState, router, activeThread, activeArtwork } = this.props
    const threadSlug = activeThread.basename
    const nextArtId = newProps.activeArtwork?.id

    setGlobalState(newProps)
    nextArtId
      ? router.replace(
          '/thread/[slug]/[artId]',
          `/thread/${threadSlug}/${nextArtId}`
        )
      : router.replace('/thread/[slug]', `/thread/${threadSlug}`)
  }
}

export default withRouter(Artwork)
