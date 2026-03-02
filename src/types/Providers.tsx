"use client";
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import ProblemProvider from '../components/context/problemContext';

export default function Providers({children}: {children:React.ReactNode}) {
  return (
    <ProblemProvider>
    <SessionProvider>
 {children}
    </SessionProvider>
   </ProblemProvider>
  )
}
