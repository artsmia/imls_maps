/** @format */

import React, { Fragment } from 'react'

const AboutComp = () => (
  <Fragment>
    <h1>About</h1>

    <p>
      The Minneapolis Institute of Art (Mia) developed this interactive map to
      illustrate how cultures exchange ideas and materials—and how art reflects
      those exchanges.
    </p>

    <p>
      The map features artworks from the museum’s collection in the context of
      historic trade routes to demonstrate the interconnected nature of Mia’s
      diverse collection, which includes more than 89,000 objects that span
      20,000 years and come from six continents.
    </p>

    <p>
      Mia chose to make the software that powers the map open source, which
      means the code is free for other organizations to use and adapt.
    </p>

    <p>Contact us at digital@artsmia.org with any questions or feedback.</p>

    <p>
      This project was made possible in part by the Institute of Museum and
      Library Services grant #MA-10-15-0094-15. The views, findings, conclusions
      or recommendations expressed in this website do not necessarily represent
      those of the Institute of Museum and Library Services.
    </p>

    <img src="/static/imls-logo.svg" style={{ maxWidth: '21em' }} />
  </Fragment>
)

export default AboutComp
