import NextAuth, { NextAuthOptions, User } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import ConnectDB from "@/lib/db/connect-db";
import Users from "@/lib/db/models/user.schema";


export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB__CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],

    callbacks: {

        // users.find logic

        signIn: async function ({ user }): Promise<boolean | string> {



            try {
                await ConnectDB();

                const foundUser = await Users.findOne({ email: user.email });

                if (!foundUser) {
                    console.log("User not found, redirecting !");
                    return "/onboarding";
                }

                // if found, allow login:
                return true;
            }

            catch (err) {

                if (err instanceof Error) {
                    console.error("Error at next-auth route.ts (signIn Callback)! >>", err?.message);

                }


                return false;

            }


        }





    },
    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
