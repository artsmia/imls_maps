/** @format */

import React from 'react'
import { useRouter } from 'next/router'

import * as data from '../../../data'

import Index from '../../index'

function ArtworkPage(props) {
  const router = useRouter()
  const { slug: threadSlug, artId } = router.query
  const { activeThreads, allObjects } = data
  const thread = activeThreads.find((thread) => thread.basename === threadSlug)
  const activeArtwork = allObjects[artId]

  console.info('artworkPage', {
    props,
    threadSlug,
    thread,
    artId,
    activeArtwork,
  })

  return thread && activeArtwork ? (
    <Index
      {...props}
      activeArtwork={activeArtwork}
      activeThread={thread}
      showSplash={false}
    />
  ) : (
    <p>Artwork page loading…</p>
  )
}

export default ArtworkPage

// export async function getStaticProps(context) {
//   console.info('thread/slug/artId getStaticProps', context)
// }
// export async function getStaticPaths(context) {
//   console.info('thread/slug/artId getStaticPaths', context)
// }
