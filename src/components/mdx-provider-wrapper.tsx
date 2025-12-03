"use client"

import { ReactNode } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { useMDXComponentsOblien } from './mdx-components'

export function MDXProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <MDXProvider components={useMDXComponentsOblien({})}>
      {children}
    </MDXProvider>
  )
} 