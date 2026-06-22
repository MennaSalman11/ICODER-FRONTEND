// import NextAuth, { NextAuthOptions, DefaultSession, User as NextAuthUser } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       handle?: string;
//       nickname?: string;
//     } & DefaultSession["user"]; 
//     accessToken?: string;
//   }

//   interface User {
//     id: string;
//     handle: string;
//     nickname?: string;
//     userToken?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     handle?: string;
//     nickname?: string;
//     accessToken?: string;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         handle: { label: "Handle", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               handle: credentials?.handle,
//               password: credentials?.password,
//             }),
//           });

//           const data = await res.json();
//           if (!res.ok) return null;

//           const payloadBase64 = data.access_token.split(".")[1];
//           const decodedPayload = Buffer.from(payloadBase64, "base64").toString();
//           const decode = JSON.parse(decodedPayload);
// console.log("JWT Payload Content:", decode);
          
//           return {
//             id: String(decode.sub || decode.id || "1"),
//             handle: decode.sub, 
//             nickname: decode.nickname || decode.sub,
//             email: decode.email || "no-email@example.com",
//             userToken: data.access_token,
//           };
//         } catch (error) {
//           console.error("Login Error:", error);
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.handle = user.handle;
//         token.nickname = user.nickname;
//        token.accessToken = user.userToken;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.handle = token.handle;
//         session.user.nickname = token.nickname;
//       }
//       (session as any).accessToken = token.accessToken;
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };
import NextAuth, { NextAuthOptions, DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle?: string;
      nickname?: string;
      numericId?: string;
      accessToken?: string;
    } & DefaultSession["user"]; 
    accessToken?: string;
    
  }

  interface User {
    id: string;
    handle: string;
    nickname?: string;
    userToken?: string;
    numericId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
    nickname?: string;
    accessToken?: string;
    numericId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        handle: { label: "Handle", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: credentials?.handle,
              password: credentials?.password,
            }),
          });

          const data = await res.json();
          if (!res.ok) return null;

          const payloadBase64 = data.access_token.split(".")[1];
          const decodedPayload = Buffer.from(payloadBase64, "base64").toString();
          const decode = JSON.parse(decodedPayload);

          
          return {
            id: String(decode.sub || "1") ,
            handle: decode.sub, 
            nickname: decode.nickname || decode.sub,
            email: decode.email || "no-email@example.com",
            userToken: data.access_token,
            numericId: String(data.user_id)
            
          };
        } catch (error) {
          console.error("Login Error:", error);
          return null;
        }
      },
    }),

    
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.handle = user.handle;
        token.nickname = user.nickname;
       token.accessToken = user.userToken;
       token.numericId = (user as any).numericId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.handle = token.handle;
        session.user.nickname = token.nickname;
        (session.user as any).numericId = token.numericId;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};