"use client";
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import ProblemProvider from '../components/context/problemContext';
import TemplateProvider from '../components/context/TemplatesContext';
export default function Providers({children}: {children:React.ReactNode}) {
  return (
    <SessionProvider> 
      <TemplateProvider>
        <ProblemProvider>
          {children}
        </ProblemProvider>
      </TemplateProvider>
    </SessionProvider>
  )
}