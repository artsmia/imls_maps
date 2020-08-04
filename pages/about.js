/** @format
 */
import React from 'react'
import Link from 'next/link'

import Header from '../components/header'
import About from '../components/about'

class About extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: '0 auto',
          width: '53em',
        }}
      >
        <About />
        <Link href="/">&larr; Back</Link>

        <style>{`
body{
    font-family: MiaGrotesk-Light, sans-serif;
    font-weight: 400;
    color:$primary;
    margin: 0;
    line-height:1em;
    font-size:1em;
}
      `}</style>
      </div>
    )
  }
}

export default About
