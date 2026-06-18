import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle: string;
      email: string;
      name?: string;
      role?: string;
      token?: string;
       numericId?: string;
    } & DefaultSession["user"]
    token: string;
  }

  interface User {
    id: string;
    handle: string;
    email: string;
    role?: string;
    token?: string;
     numericId?: string;
  }
}
// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {

//   interface User {
//     id: string;
//     handle: string; 
//     email: string;
//     name?: string;
//     role?: string;
//     token?: string; 
//   }

//   // دي البيانات اللي بنشوفها لما بننادي useSession()
//   interface Session {
//     user: {
//       id: string;
//       handle: string;
//       role?: string;
//     } & DefaultSession["user"];
//     accessToken?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     user?: any; // عشان تقدري تخزني الـ user object كامل جوه الـ token
//   }
// }