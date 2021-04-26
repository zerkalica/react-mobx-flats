import '@demo/lib-server/polyfill'

import express from 'express'
import fetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { DemoLibFetchProvider, DemoLibFetchRequestInit } from '@demo/lib-fetch/fetch.js'
import { demoLibServerMdlConfig } from '@demo/lib-server/mdl/config'
import { demoLibServerMdlError } from '@demo/lib-server/mdl/error'
import { demoLibServerMdlRender } from '@demo/lib-server/mdl/render'
import { demoLibServerOnListen } from '@demo/lib-server/onListen'
import { FetchLike } from '@psy/core'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootProdBrowserConfig } from './browserConfig'
import { DemoLibUIContextBuilder } from '@demo/lib-ui/context'

const distRoot = __dirname
const config = {
  ...demoSearchBootCommonServerConfig,
  ...demoSearchBootProdBrowserConfig,
  pkgName: demoSearchPkgName,
}

const configMiddleware = demoLibServerMdlConfig({
  ...config,
  fetch: fetch as FetchLike<DemoLibFetchRequestInit>,
})

express()
  .use(configMiddleware)
  .use(express.static(path.join(distRoot, 'public'), { index: false }))
  .use(
    demoLibServerMdlRender({
      render(host) {
        const { location, fetcher, pkgName } = demoLibServerMdlConfig.get(host)

        const ctx = new DemoLibUIContextBuilder()
          .v(DemoLibFetchProvider, {
            fetch: fetcher.fetch,
            location,
          })
        return <ctx.Provider><DemoSearch id={pkgName} /></ctx.Provider>
      },
    })
  )
  .use(demoLibServerMdlError)
  .listen(config.port, demoLibServerOnListen({ port: config.port }))
