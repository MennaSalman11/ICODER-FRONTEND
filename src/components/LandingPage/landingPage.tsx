import Image from 'next/image'
import { Navbar } from '../layout/Navbar'
import style from './page.module.css'
import Footer from '../layout/Footer'
import { TiWorld } from "react-icons/ti";
import { BiTrophy } from "react-icons/bi";
import { MdOutlineGroupAdd } from "react-icons/md";
import { MdVideoCameraFront } from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";
import { LuSquareCode } from "react-icons/lu";
export default function LandingPage() {
  return (
    <>

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#0f172a] to-black">

      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>

      {/* Content */}
      <section className="lg:flex justify-between items-center container">

      <div className="relative z-10 flex min-h-screen flex-col justify-center px-12 text-white ">
        <h1 className="text-6xl font-bold text-white max-w-xl ">
          Master Algorithms. <br />
          <span className="text-orange-300">Conquer Contests.</span>
        </h1>
        <p className=' text-xl text-orange-100 pt-4'>The all-in-one platform for competitive programmers.<br/>
         Solve problems from major judges, join groups, and track<br/>
          your progress in real-time.</p>
      </div>

      <div className=" text-white  p-6 rounded-2xl ms-10 md:max-w-full md:m- md:mb-7">
      <div className=''>
<div className='flex px-2  rounded-tr-xl rounded-tl-xl p-3 bg-gradient-to-br from-[#253266] via-[#15264d] md:max-w-lg'>
  <div className='w-3 h-3 bg-red-600 rounded-full m-1'></div>
  <div className='w-3 h-3 bg-orange-500 rounded-full m-1'></div>
  <div className='w-3 h-3 bg-green-500 rounded-full m-1'></div>
<span className='ms-1 mb-0.5'>solution.cpp</span>
</div>
      </div>

      <div className='md:max-w-lg'>
<Image
src="/code.png"      
        alt="code image"
        width={550}           
        height={500}
        />
      </div>

      <div className='bg-gradient-to-br from-[#253266] via-[#15264d] flex justify-between p-3 rounded-bl-xl rounded-br-xl md:max-w-lg'>
        <div>
<p>Output</p>
<ul>
  <li>Test Case #1: <span className='text-green-400'>Passed</span> </li>
  <li>Test Case #2: <span className='text-green-400'>Passed</span></li>
</ul>
        </div>
<div>
  <p className='text-green-500'>heck_circle
Accepted (12ms)</p>
</div>
      </div>

      </div>
        </section>
      <section className=' container m-auto'>
        <section>
          <h1 className='text-4xl font-bold text-center text-white'>Everything you need to <span className='text-orange-400'>level up</span> </h1>
        </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-13 m-8 my-16">

         <div className="group p-7 border rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
          <div className='bg-slate-800 group-hover:bg-slate-600 text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <TiWorld size={30} className='  ' />
          </div>
           <h3 className='text-2xl py-1.5 font-bold text-white '>Universal Judge Support</h3>
    <p className='pt-1 text-sm text-orange-100'>Submit to Codeforces, LeetCode,<br/>
     AtCoder, and other popular coding platforms from a single interface.</p>
         </div>

  <div className="group p-6 border rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
      <div className='group-hover:bg-slate-600 bg-slate-800 group-hover:bg-slate-600 text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <BiTrophy size={30} />
          </div>
      <h3 className='text-2xl py-1.5 font-bold text-white '>Internal Contests</h3>
    <p className='pt-1 text-sm text-orange-100'>Host private contests for your university<br/>
     club or study group with custom scoring rules and leaderboards.</p>
  </div>

  <div className="group p-6 border rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
        <div className='group-hover:bg-slate-600 bg-slate-800 text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <MdOutlineGroupAdd size={30} />
          </div>
      <h3 className='text-2xl py-1.5 font-bold text-white '>Join Groups</h3>
    <p className='pt-1 text-sm text-orange-100'>Find like-minded peers, join study squads, and <br/>
    challenge each other to daily problem streaks.</p>
  </div>

  <div className="group p-6 border rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
             <div className='group-hover:bg-slate-600 bg-slate-800  text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <MdVideoCameraFront size={30} />
          </div>
      <h3 className='text-2xl py-1.5 font-bold text-white '>Collaborative Meetings</h3>
    <p className='pt-1 text-sm text-orange-100'>Real-time syntax syncing, voice chat, and<br/>
     whiteboard tools built specifically for explaining<br/> algorithms.</p>
  </div>

  <div className="group p-6 border rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
      <div className='group-hover:bg-slate-600 bg-slate-800  text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <IoMdAnalytics size={30} />
          </div>
     <h3 className='text-2xl py-1.5 font-bold text-white '>Progress Analytics</h3>
    <p className='pt-1 text-sm text-orange-100'>Visualize your growth with detailed charts on<br/>
     topic strength, difficulty curves, and solve times..</p>
  </div>

  <div className="group p-6 border-1 rounded-2xl border-gray-700 hover:border-white bg-gradient-to-br hover:from-[#24293c] hover:via-[#24293c] transition-all duration-500">
       <div className='bg-slate-800 group-hover:bg-slate-600 text-orange-100 group-hover:text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300'>
 <LuSquareCode size={30} />
          </div>
     <h3 className='text-2xl py-1.5 font-bold text-white '>API & Extensions</h3>
    <p className='pt-1 text-sm text-orange-100'>Use our browser extension to parse problems<br/>
     directly into your local IDE instantly.</p>
  </div>
      </div>
      </section>
    </div>
    <Footer/>
</>
  )
}
