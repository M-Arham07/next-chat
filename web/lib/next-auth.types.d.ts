import { type DefaultSession } from "next-auth"
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      username?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null
    image?: string | null
  }
}

export { }
