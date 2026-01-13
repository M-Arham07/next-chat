"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Users from "@/lib/db/models/user.schema";
import { getServerSession } from "next-auth";

export default async function CreateUser(username: string): Promise<boolean> {
    
    //TODO: Image upload logic ! 
    try {

        const session = await getServerSession(authOptions);

        if (!username) throw new Error("No username provided");

        if (!session?.user) throw new Error("No session exists!");

        if (session.user.username) throw new Error("Onboarding is already done!");


        const newUser = { ...session, username: username };

        await Users.create(newUser);

        return true;

    }
    catch (err) {


        if(err instanceof Error){
            console.error("Error in onboarding process at CreateUser >>",err?.message);
        }

        return false;

    }


}