/** @format */

import React from 'react'
import { useRouter } from 'next/router'

import * as data from '../../data'

import Index from '../index'

function ThreadBySlug(props) {
  const router = useRouter()
  const { slug } = router.query
  const thread = data.activeThreads.find((thread) => thread.basename === slug)

  return thread ? (
    <Index {...props} activeThread={thread} showSplash={false} />
  ) : (
    <p>Loading…</p>
  )
}

export default ThreadBySlug

/**
 * setting up static rendering this way is probably overkill?
 * Just importing the variables is easier
 * https://nextjs.org/docs/basic-features/data-fetching
 */
// export function getStaticProps(context) {
//   debugger
// }
// export function getStaticPaths(context) {
//   debugger
// }
