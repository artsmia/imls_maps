import Head from 'next/head'

export default (props) => {
  return <header style={{height: props.headerHeight}}>
    Here's the header

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
      }
    `}</style>
  </header>
}

