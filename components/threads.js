import React from 'react'
import 'isomorphic-fetch'

import { allObjects, activeThreads, objectIds } from '../data'

import ThreadList from './thread-list'
import ThreadMarkers from './thread-markers'

export default class extends React.Component {
  render () {
    const {artMeta, activeArtwork} = this.props
    const propsToPass = {...this.props, threads: activeThreads}

    return <div id="threads" style={{top: this.props.headerHeight}}>
      {activeArtwork ? <span /> : <ThreadList {...propsToPass} />}
      {artMeta && <ThreadMarkers {...propsToPass} objects={allObjects} />}

      <style>{`
        #threads {
          position: absolute;
          top: 7vh;
          left: 71vw;
          width: 29vw;
        }
      `}</style>
    </div>
  }

  componentWillMount () {
    this.getArtworkData(artMeta => {
      this.props.setGlobalState({artMeta, activeThreads})
    })
  }

  // TODO merge this into the data module?
  getArtworkData (callback) {
    fetch('https://search.artsmia.org/ids/'+objectIds.join(','))
    .then(res => res.json())
    .then(artMeta => {
      var artworks = artMeta.hits.hits.forEach(function(artworkMeta) {
        var id = artworkMeta._id
        if(allObjects[id]) allObjects[id].meta = artworkMeta._source
      })
      callback && callback(artMeta)
    })
  }
}
