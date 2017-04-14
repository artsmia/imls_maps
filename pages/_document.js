import Document, {Head, Main, NextScript} from 'next/document'
import flush from 'styled-jsx/server'

export default class MyDocument extends Document {
  static getInitialProps ({renderPage}) {
    const {html, head} = renderPage()
    const styles = flush()
    return {html, head, styles}
  }

  render () {
    return (
      <html>
        <Head>
          <style>{`body { margin: 0 }`}</style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.1/leaflet.css" />
          <link rel="stylesheet" href="/static/leaflet.fullscreen.css" />
          <script src="https://mapzen.com/tangram/0.8/tangram.min.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
