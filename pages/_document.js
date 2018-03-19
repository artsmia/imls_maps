import Document, {Head, Main, NextScript} from 'next/document'
import flush from 'styled-jsx/server'

export default class MyDocument extends Document {
  static getInitialProps ({renderPage}) {
    const { html, head, errorHtml, chunks } = renderPage()
    const styles = flush()
    return { html, head, errorHtml, chunks, styles }
  }

  render () {
    return (
      <html>
        <Head>
          <style>{`
            body { margin: 0 }

            .iconButton:hover, .iconButton:active {
              background-color: rgba(100, 200, 300, 0.2);
            }
          `}</style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.1/leaflet.css" />
          <link rel="stylesheet" href="/static/leaflet.fullscreen.css" />
          <link rel="stylesheet" href="https://mia-grotesk.s3.amazonaws.com/index.css" />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <script src="https://mapzen.com/tangram/0.8/tangram.min.js"></script>
          <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.14.3/mapbox-gl.css' rel='stylesheet' />
          <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.14.3/mapbox-gl.js'></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
