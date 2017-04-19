import React from 'react'

// TODO onclick changes active thread
export default (props) => {
  const activateThread = (thread) => props.setGlobalState({activeThread: thread})
  const threadBorderColorStyles = props.threads.map((thread, index) => `
    li.thread-${index} { border-left-color: ${thread.color}; }
  `).join('')

  return <ul>
    {props.threads.map((thread, index) => {
      const threadIsActive = props.activeThread == thread 
      const threadElem = <span onClick={activateThread.bind(this, thread)}>
        {thread.title}
      </span>

      return <li className={`thread-${index}`} key={thread.title}>
        {threadIsActive ?
          <strong>{threadElem}</strong> :
          threadElem
        }
      </li>
    })}
    <style>{`
      ul { 
        display: block;
        width: 100%;
        padding: 0;
        margin: 0;
      }
      li {
        list-style: none;
        font-size: 2em;
        border: 1px solid black;
        border-width: 1px 0 1px 0;
        border-left: 1rem solid transparent;
        cursor: pointer;
      }
      li span {
        display: inline-block;
        padding: 2.5rem 4vw;
      }
      ${threadBorderColorStyles}
    `}</style>
  </ul>
}
