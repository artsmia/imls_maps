/** @format */

import React from 'react'
import 'isomorphic-fetch'

import { allObjects, activeThreads, objectIds } from '../data'

import ThreadList from './thread-list'
import ThreadMarkers from './thread-markers'

export default class extends React.Component {
  render() {
    const { artMeta, activeArtwork } = this.props
    const propsToPass = { ...this.props, threads: activeThreads }

    return (
      <div id="threads" style={{ top: this.props.headerHeight }}>
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
    )
  }
}
