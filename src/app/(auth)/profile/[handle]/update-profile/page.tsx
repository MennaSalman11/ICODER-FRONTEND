"use client";
import { getUserToken } from "@/src/lib/server-utils";
// import { getProfilePicture, updateProfilePicture } from "@/src/lib/services/changePicture.services";
import { updateGeneralSettingsData } from "@/src/lib/services/general-settings.services";
import {
  getProfile,
  getProfilePicture,
} from "@/src/lib/services/profile.services";
import { GeneralSettingsPayload, GeneralSettingsSchema } from "@/src/schema/generalSettings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { deleteProfilePicture,  updateProfilePicture } from "@/src/lib/services/changePicture.services";
import { useSession } from "next-auth/react";


export default function GeneralSettingsPage() {
const [previewImage, setPreviewImage] = useState<string | null>(null);
const { data: session, status } = useSession();

const imageInputRef = useRef<HTMLInputElement>(null);



const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm<GeneralSettingsPayload>({
  resolver: zodResolver(GeneralSettingsSchema),
  defaultValues: {
    nickname: "",
    school: "",
    current_password: "",
  },
});
  const params = useParams();
 const handleFromUrl = params.handle; 
  const [userData, setUserData] = useState<any>(null);
// useEffect(() => {
//   if (!handleFromUrl) return;

//   const fetchData = async () => {
//     const profileRes = await getProfile(handleFromUrl as string);

//     if (profileRes.ok) {
//       setUserData(profileRes.data);
//     }

//     const pictureRes = await getProfilePicture(handleFromUrl as string);

//     if (pictureRes.ok && pictureRes.data?.picture_url) {
//       setUserData((prev: any) => ({
//         ...prev,
//         picture_url: pictureRes.data.picture_url,
//       }));
//     }
//   };

//   fetchData();
// }, [handleFromUrl]);
useEffect(() => {
  if (handleFromUrl) {
    const fetchProfile = async () => {
      const res = await getProfile(handleFromUrl as string);

      if (res.ok) {
        setUserData(res.data);

        reset({
          nickname: res.data.nickname || "",
          school: res.data.school || "",
          current_password: "",
        });
      }
    };

    fetchProfile();
  }
}, [handleFromUrl, reset]);
// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   // const reader = new FileReader();
//   // reader.readAsDataURL(file);
//   // reader.onloadend = async () => {
//   //   const base64String = reader.result as string;
//   //   setPreviewImage(base64String);

// //     try {
// //       // تمرير الـ base64 و الـ handle من الـ params
// //       const res = await updateProfilePicture(base64String);
      
// //       if (res.ok) {
// //         toast.success("Photo updated!");
// //       } else {
// //         toast.error("Failed to update photo");
// //       }
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   };
// // };
//   const objectUrl = URL.createObjectURL(file);
  
//   setPreviewImage(objectUrl);
//    try {
// const base64 = await fileToBase64(file);

// const pureBase64 = base64.split(",")[1];

// const res = await updateProfilePicture(pureBase64);
//     if (res.ok) {
//       toast.success("Photo updated!");
//     } else {
//       toast.error("Failed with FormData too");
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  setPreviewImage(objectUrl);

  try {
    const res = await updateProfilePicture(file);
console.log(res.data);
    if (res.ok) {
      toast.success("Photo updated!");
    } else {
      toast.error("Failed to update photo");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};
const handleRemovePhoto = async () => {
  const res = await deleteProfilePicture();

  if (res.ok) {
  
    setPreviewImage(null); 
    
    if (userData) {
      setUserData({ ...userData, picture_url: null });
    }

    toast.success("Profile picture removed successfully" ,{position:'top-right'});
  } else {
    toast.error("Failed to remove photo",);
  }
};



const onsubmit = async (data: GeneralSettingsPayload) => {
    console.log(data);
    const res = await updateGeneralSettingsData(data);
    if(res.ok){
      toast.success('General settings updated successfully',{
    position:'top-right'
      });
    } else{
      toast.error('Failed to update general settings',{
        position:'top-right'
      });
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-950 mb-8">General</h2>
      
      <form className="space-y-6" onSubmit={handleSubmit(onsubmit)}>
      
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl overflow-hidden">
            {
              previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : userData?.picture_url ? (
                <img src={userData.picture_url} alt="profileImg" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No Image</span>
                </div>
              )
            }
</div>
          <div>
             <p className="font-bold text-blue-900">Profile Picture</p>
             <p className="text-xs text-gray-400 mb-2">PNG, JPG or GIF. Max size 6MB.</p>
          <div className="flex gap-2">
<button 
    type="button" 
    onClick={() => imageInputRef.current?.click()} 
    className="bg-blue-950 text-white px-4 py-1.5 rounded-lg"
  >
    Change Photo
  </button>

 
  <input 
    type="file"
    ref={imageInputRef} 
    accept="image/*" 
    className="hidden" 
    onChange={handleFileChange} 
  />
  
  <button 
  type="button" 
  onClick={handleRemovePhoto} 
  className="text-red-500 text-sm hover:text-red-700 transition-colors cursor-pointer"
>
  Remove
</button>
</div>
          </div>
        </div>

        {/* (Inputs) */}
        <div>
          <label className="block text-blue-950 font-bold mb-2">Nick name</label>
          <input
          {...register('nickname')}
          type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none" placeholder="menna" />
        {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
        </div>

        <div>
          <label className="block text-blue-950 font-bold mb-2">School</label>
          <input
          {...register('school')}
          type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none" placeholder="El safa" />
        {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school.message}</p>}
        </div>

           <div>
          <label className="block text-blue-950 font-bold mb-2">Current Password</label>
          <input 
          {...register('current_password')}
          type="password" className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none" placeholder="Enter current password" />
{errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}        </div>

       
        <div className="flex justify-end gap-4 mt-10">
           <button className="px-6 py-2.5 rounded-xl text-white bg-[#011F4B] hover:bg-[#033176] transition-all">
            Reset Changes
            </button>
           <button type="submit"
           disabled={isSubmitting}
           className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
            {isSubmitting ? "Saving..." : "Save Changes"}
           </button>
        </div>
      </form>
    </div>
  );
}