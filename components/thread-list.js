import React from 'react'

// TODO onclick changes active thread
export default ({threads}) => (
  <ul>
    {threads.map(thread => {
      return <li key={thread.title}>
        {thread.title}
      </li>
    })}
  </ul>
)
