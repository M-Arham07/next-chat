import NextAuth, { NextAuthOptions, User } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import ConnectDB from "@/lib/db/connect-db";
import Users from "@/lib/db/models/user.schema";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { UserInterface } from "@/packages/shared/types";


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

        // signIn: async function ({ user }): Promise<boolean | string> {




        //     try {
        //         await ConnectDB();

        //         const foundUser = await Users.findOne({ email: user.email });

        //         if (!foundUser) {
        //             console.log("User not found, redirecting !");
        //         }

        //         // if found, allow login:
        //         return true;
        //     }

        //     catch (err) {

        //         if (err instanceof Error) {
        //             console.error("Error at next-auth route.ts (signIn Callback)! >>", err?.message);

        //         }


        //         return false;

        //     }


        // }


        jwt: async function ({ token, session }): Promise<JWT> {


            try {

                await ConnectDB();
                const foundUser: UserInterface | null = await Users.findOne({ email: token.email });

                token.username = foundUser?.username;

                // if foundUser doesent exist ie : foundUser is null, token.username will be null

                // (WE'LL ONLY SAVE USER TO DATABASE AFTER ONBOARDING HAS COMPLETED!)

                // so we will block that user via proxy to access chat app, and send the user to onboarding


                return token;




            }


            catch (err) {

                if (err instanceof Error) {
                    console.error("Error at next-auth route.ts (JWT callback) >> ", err?.message);
                }

                return token;


            }









        },
        session: async function ({ token,session }) : Promise<Session>  {


            // token.username might be undefined , if it is we'll manage it via middleware !
            session.user.username = token?.username;
            return session;



        }






    },
    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
