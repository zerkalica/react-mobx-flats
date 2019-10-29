import express from 'express'
import { FetchLike } from 'mobx-psy'
import {
  extractHtmlParts,
  locationFromNodeRequest,
  ServerRender,
} from 'mobx-psy-ssr'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import {indexHtml} from './index.html'

import { MobxPsyExamples, LocationStore, pkgName, stateKey } from '../..'

interface ReactMiddlewareProps {
  apiUrl?: string
  fetch: FetchLike<any>
  publicUrl: string
  entry?: string
}

export function reactMiddleware({
  apiUrl = '/',
  fetch,
  publicUrl,
  entry = 'browser'
}: ReactMiddlewareProps) {
  const html = indexHtml({publicUrl, entry, pkgName})

  const { header, footerPre, footerPost } = extractHtmlParts({
    pkgName,
    stateKey,
    html,
  })

  return (req: express.Request, res: express.Response, next?: () => void) => {
    const location = new LocationStore(locationFromNodeRequest(req, req.secure))
    new ServerRender({
      fetch,
      apiUrl,
      render: (fetch, cache) =>
        ReactDOMServer.renderToNodeStream(
          <MobxPsyExamples location={location} fetch={fetch} cache={cache} keepCache />
        ),
      success(body, state) {
        res.send(
          `${header}${body}${footerPre}=${JSON.stringify(state)}${footerPost}`
        )
      },
      error(error) {
        console.log(error.stack)
        res.status(500).send('' + error)
      },
    }).run()
  }
}
