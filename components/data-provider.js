import React from 'react'

var threads = require('../threads.json')
var objects = require('../objects.json')

export default class extends React.Component {
  render () {
    console.info('thread provider render', this.props)
    return <div>{this.props.children(threads, objects}</div>
  }

  componentDidMount () {
    console.info('thread provider cDM', threads, objects)
  }
}
