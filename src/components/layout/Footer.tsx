import React from 'react'

export default function Footer() {
  return (
    <>
    <div className='bg-gradient-to-br from-[#252e53] via-[#0b0d15] to-black py-10'>
<div className="container flex justify-around">

<div className='p-3 '>
    <span className='text-3xl font-bold text-white mb-5'>ICoder</span>
    <p className='text-sm text-orange-100 py-2'>The modern platform for algorithmic mastery.<br/> 
    Built for the community, by the community.
</p>
</div>

<div className='p-4'>
<span className='text-2xl text-white font-bold'>Platform</span>
<ul className='py-5 text-orange-100 '>
    <li className='py-2 hover:text-orange-50'>Problems</li>
    <li className='py-2 hover:text-orange-50'>Contests</li>
    <li className='py-2 hover:text-orange-50'>Leadboard</li>
   
</ul>
</div>

<div className='p-4'>
<span className='text-2xl text-white font-bold'>Resources</span>
<ul className='py-5 text-orange-100'>
    <li className='py-2 hover:text-orange-50'>API Docs</li>
    <li className='py-2 hover:text-orange-50'>Blog</li>
    <li className='py-2 hover:text-orange-50'>Community Guidlines</li>
   
</ul>
</div>

<div className='p-4'>
<span className='text-2xl text-white font-bold'>Company</span>
<ul className='py-5 text-orange-100 '>
    <li className='py-2 hover:text-orange-50'>About</li>
    <li className='py-2 hover:text-orange-50'>Careers</li>
    <li className='py-2 hover:text-orange-50'>Contact</li>
   
</ul>
</div>

</div>

<span className='text-sm text-orange-50 ps-17'>© 2023 ICoder Inc. All rights reserved.</span>
    </div>
    </>
  )
}
