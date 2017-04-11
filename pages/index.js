import React from 'react'

import Map from '../components/map'
import Threads from '../components/threads'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {map: null}
  }

  static async getInitialProps ({req}) {
    return {}
  }

  render () {
    let propsToPass = {
      setGlobalState: this.setGlobalState.bind(this),
      ...this.state,
    }

    return (
      <div>
        <Map {...propsToPass} />
        {this.state.map && <Threads {...propsToPass} />}
      </div>
    )
  }

  setGlobalState (state) {
    // be sure to `.bind` this when passing it to subcomponents,
    // or `.setState` won't be defined
    // …also global state is bad or something. Learn redux
    console.info(
      'updating global state with ',
      state,
      'it will look something like ',
      {...this.state, ...state}
    )
    this.setState && this.setState(state)
  }

  componentDidMount () {
    console.info('index.js mounted')
  }
}
