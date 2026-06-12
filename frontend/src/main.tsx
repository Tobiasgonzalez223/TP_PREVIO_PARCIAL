import * as React from 'react'
import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppContainer from './AppContainer'

const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
)
