"use client";
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import ProblemProvider from '../components/context/problemContext';
import TemplateProvider from '../components/context/TemplatesContext';
import { UserProvider } from '../components/context/UserContext';
export default function Providers({children}: {children:React.ReactNode}) {
  return (
    <SessionProvider> 
      <UserProvider>
      <TemplateProvider>
        <ProblemProvider>
          {children}
        </ProblemProvider>
      </TemplateProvider>
      </UserProvider>
    </SessionProvider>
  )
}