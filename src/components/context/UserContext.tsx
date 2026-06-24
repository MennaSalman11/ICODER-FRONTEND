// // src/components/context/UserContext.tsx
// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import { getProfilePicture } from "@/src/lib/services/profile.services";
// import { useSession } from "next-auth/react";

// interface UserContextType {
//   profilePicture: string | null;
//   setProfilePicture: (url: string | null) => void;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const [profilePicture, setProfilePicture] = useState<string | null>(null);
//   const { data: session, status } = useSession();

// useEffect(() => {
//   const fetchPicture = async () => {
//     const handle = session?.user?.handle;
//     if (!handle) return;

//     const res = await getProfilePicture(handle);
//     console.log("UserContext fetchPicture res:", res.data); // ✅
//     if (res.ok && res.data?.picture_url) {
//       setProfilePicture(res.data.picture_url);
//       console.log("UserContext setProfilePicture:", res.data.picture_url); // ✅
//     }
//   };

//   if (status === "authenticated") {
//     fetchPicture();
//   }

//   if (status === "unauthenticated") {
//     setProfilePicture(null);
//   }
// }, [status, session]);
//   return (
//     <UserContext.Provider value={{ profilePicture, setProfilePicture }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export const useUserContext = () => {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUserContext must be used within UserProvider");
//   return context;
// };

"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getProfilePicture } from "@/src/lib/services/profile.services";
import { useSession } from "next-auth/react";

interface UserContextType {
  profilePicture: string | null;
  setProfilePicture: (url: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const manuallySet = useRef(false); // ✅ flag مش بيعمل re-render
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPicture = async () => {
      const handle = session?.user?.handle;
      if (!handle) return;
      if (manuallySet.current) return; // ✅ لو اتغيرت يدوياً متجيبش من السيرفر

      const res = await getProfilePicture(handle);
      if (res.ok && res.data?.picture_url) {
        setProfilePictureState(res.data.picture_url);
      }
    };

    if (status === "authenticated") {
      fetchPicture();
    }

    if (status === "unauthenticated") {
      setProfilePictureState(null);
      manuallySet.current = false; // ✅ reset عند الـ logout
    }
  }, [status, session]);

  // ✅ لما حد يغير الصورة يدوياً، اضبط الـ flag
  const setProfilePicture = (url: string | null) => {
    manuallySet.current = true;
    setProfilePictureState(url);
  };

  return (
    <UserContext.Provider value={{ profilePicture, setProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserProvider");
  return context;
};