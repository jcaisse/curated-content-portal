import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
// UserRole is now a string type

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true
          }
        })

        if (!user) {
          return null
        }

        // Verify password using bcrypt or direct comparison (for testing)
        let passwordMatch = false;
        
        if (user.password && credentials.password) {
          // Check if password is hashed (longer than 20 chars) or plain text
          if (user.password.length > 20) {
            // Assume it's bcrypt hashed
            passwordMatch = await bcrypt.compare(credentials.password as string, user.password);
          } else {
            // Assume it's plain text (for testing)
            passwordMatch = user.password === credentials.password;
          }
        }
        
        if (passwordMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
