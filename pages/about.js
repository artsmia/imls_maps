/** @format
 */
import React from 'react'

import Header from '../components/header'
import About from '../components/about'

export default class extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  static async getInitialProps({ req }) {
    return {}
  }

  render() {
    return <About />
  }
}
