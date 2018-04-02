import React from 'react'

// TODO onclick changes active thread
export default class ThreadList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const props = this.props

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

        return <li className={`thread-${index}`} key={thread.title} style={{opacity: !props.activeThread || threadIsActive ? '1' : '0.5'}}>
          {threadIsActive ?
            <div style={{backgroundColor: 'black'}}>
              <strong style={{color: 'white'}}>{threadElem}</strong>
              <QuickFacts thread={thread} />
            </div> :
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
          padding: 2.5rem 1.75vw;
        }
        ${threadBorderColorStyles}
      `}</style>
    </ul>
  }
}

class QuickFacts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {index: 0}
  }

  render() {
    const {thread} = this.props

    const {index} = this.state
    const activeFact = thread.facts[index]

    const dotSize = '0.1em'
    const dotStyle = {
      backgroundColor: '#aaa',
      borderRadius: '1em',
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      margin: '0 0.05em',
      padding: dotSize,
    }

    const factSelectors = thread.facts.map((fact, index) => {
      return fact == activeFact
        ? <span style={{...dotStyle, backgroundColor: '#232323'}} />
        : <span
            style={dotStyle}
            onClick={this.changeQuickFact.bind(this, index)}
          />
    })
    const nextFact = this.changeQuickFact.bind(this, index+1)

    return <div style={{backgroundColor: '#eee', padding: '0.5em'}}>
      <h4 style={{display: 'inline-block', paddingRight: '0.5em', marginBottom: 0, marginTop: 0}}>Quick Facts</h4> 
      <p style={{marginBottom: 0, fontFamily: 'MiaGrotesk-Light'}} onTouchEnd={nextFact}>
        {activeFact} 
      </p>
      <div style={{paddingTop: '0.5em'}}>
        {factSelectors}
        <a style={{color: 'red', marginLeft: '1em'}} onClick={nextFact}>See next &rarr;</a>
      </div>
      <p>Select an artwork on the map to begin.</p>
    </div>
  }

  changeQuickFact(index) {
    const {thread} = this.props

    this.setState({
      index: index % thread.facts.length,
    })
  }
}
