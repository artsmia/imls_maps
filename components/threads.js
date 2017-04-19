import React from 'react'
import 'isomorphic-fetch'

let allThreads = require('../threads.json')

Object.keys(allThreads).map(key => {
  let thread = allThreads[key]
  allThreads[key].facts = thread.__content.split('\n').filter(fact => fact !== "")
  thread.title = thread.thread[0]
  // thread.artworkIds = []
  thread.artworks = []
})
let activeThreads = [
  'silk-road',
  'red-dye-from-mexico',
  'blue-white',
].map(t => allThreads[t]).filter(t => !!t)

let allObjects = require('../objects.json')
var objectIds = Object.keys(allObjects)

objectIds.map(key => {
  let object = allObjects[key]
  object.threads.map(threadName => {
    var associatedThread = Object.values(allThreads).find(t => t.thread[0] == threadName)
    if(associatedThread) {
      // associatedThread.artworkIds.push(object.id)
      associatedThread.artworks.push(object)
    }
  })
})

Object.values(allThreads).map(thread => {
  if(thread.order) {
    const threadOrder = thread.order.split(" ")
    thread.artworks = thread.artworks.sort((a, b) => {
      return threadOrder.indexOf('' + a.id) - threadOrder.indexOf('' + b.id)
    })
  }
})

import ThreadList from './thread-list'
import ThreadMarkers from './thread-markers'

export default class extends React.Component {
  render () {
    const {artMeta} = this.props
    const propsToPass = {...this.props, threads: activeThreads}
    return <div id="threads" style={{top: this.props.headerHeight}}>
      <ThreadList {...propsToPass} />
      {artMeta && <ThreadMarkers {...propsToPass} objects={allObjects} />}

      <style>{`
        #threads {
          position: absolute;
          top: 7vh;
          left: 71vw;
        }
      `}</style>
    </div>
  }

  constructor () {
    super()
    this.state = {artMeta: null}
  }

  componentWillMount () {
    this.getArtworkData(artMeta => {
      this.props.setGlobalState({artMeta, activeThreads})
    })
  }

  getArtworkData (callback) {
    fetch('https://search.artsmia.org/ids/'+objectIds.join(','))
    .then(res => res.json())
    .then(artMeta => {
      var artworks = artMeta.hits.hits.forEach(function(artworkMeta) {
        var id = artworkMeta._id
        allObjects[id].meta = artworkMeta._source
      })
      callback && callback(artMeta)
    })
  }
}
