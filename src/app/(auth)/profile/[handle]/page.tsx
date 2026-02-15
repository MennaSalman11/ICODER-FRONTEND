
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "@/src/lib/services/profile.services";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
export default function ProfilePage() {
  const params = useParams();
  const handleFromUrl = params.handle; 
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (handleFromUrl) {
      const fetchProfile = async () => {
        const res = await getProfile(handleFromUrl as string);
        if (res.ok) {
          setUserData(res.data);
        }
      };
      fetchProfile();
    }
  }, [handleFromUrl]);

  if (!userData) return <div className="text-white text-center py-20">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
  <section className=" pt-24 px-4"> 
 
    <div className="max-w-7xl mx-auto rounded-xl shadow-md p-6 flex justify-between items-center bg-white">
     {/* left side */}
     <div className="flex items-center space-x-4 space-y-3">
      {
        userData.picture_url ? (
       <img src={userData.picture_url} alt="profileImg" className="w-16 h-16 rounded-full" />

        ) :(
<div>

  <FaUser className="w-16 h-16 text-gray-400 rounded-full bg-gray-200 p-2" />
</div>
        )
      }
       <div>
         <h2 className="text-xl font-bold">{userData.nickname}</h2>
         <p className="text-sm text-gray-600">{userData.handle}</p>
         <p className="text-sm text-gray-600">{userData.email}</p>
         {userData.school? <p className="text-sm text-gray-600">{userData.school}</p> : <p className="text-sm text-gray-600">No School</p>}
       </div>
     </div>
     {/* right side */}
     <div className="flex space-x-4 self-end">
       <button className="bg-[#FF7D40] hover:bg-[#f88f5e] text-white py-2 px-4 rounded-lg cursor-pointer transition-all duration-300">
        
        <Link 
  href={`/profile/${userData.handle}/update-profile`}

>
  Edit Profile
</Link>
       </button>
     </div>
    </div>
  </section>
    </div>
  );
}