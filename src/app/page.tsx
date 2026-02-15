"use client"
import Image from "next/image";
import HomePage from "../components/Home/home";
import LandingPage from "../components/LandingPage/landingPage";
import { Navbar } from "../components/layout/Navbar";
import Providers from "../types/Providers";
import { useSession } from "next-auth/react";


export default function Home() {
    const {data:session , status} = useSession();
    console.log(session);
  return (
    <>
    <Providers>
    <Navbar/>
    {
      status==='loading'?
      <p>loading...</p>
      :(
    status==='unauthenticated'?
      <LandingPage/>
      :
      <HomePage/>
      )
  

    }

    </Providers>
    
    </>

  );
}
