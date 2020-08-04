/** @format */

import Head from 'next/head'

const Header = (props) => {
  const hide = props.headerHeight === '0vh'
  const style = {
    position: hide ? 'inherit' : 'fixed',
    zIndex: hide ? 0 : 10000,
    height: props.headerHeight,
  }

  return (
    <header style={style}>
      <h1>Explore Mia's Global Collection through World History</h1>
      <p>Touch a topic below to begin</p>

      <style>{`
      body {
        font-family: MiaGrotesk-Light, sans-serif;
        line-height: 2rem;
        font-weight: 400;
        color: #232323;
        margin: 0;
        font-size: 1em;
      }

      h1, h2, h3, h4, h5, h6, strong {
        font-family: MiaGrotesk-Bold;
      }
    `}</style>
      <style jsx>{`
        header {
          height: 7vh;
          width: 100%;
          background-color: #232323;
          margin: 0;
          color: white;
        }

        h1 {
          width: 50%;
          float: left;
          margin: 3rem 0 0 1em;
          font-size: 3vw;
          line-height: 1.2em;
        }

        p {
          width: 22%;
          float: right;
          font-size: 2em;
          margin-top: 3em;
        }
        p:before {
          content: ${`'\u2193'`};
          position: relative;
          left: -5rem;
          top: 3rem;
          display: block;
          font-size: 3em;
        }
      `}</style>
    </header>
  )
}

export default Header
