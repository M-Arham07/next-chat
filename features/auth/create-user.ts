"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectDB from "@/lib/db/connect-db";
import Users, { UserSchemaType } from "@/lib/db/models/user.schema";
import { UserInterface } from "@/packages/shared/types";
import { getServerSession } from "next-auth";


type CreateUserFn = {
    success: boolean,
    errMsg?: string
}

const CreateUser = async (username: string, newImage?: string): Promise<CreateUserFn> => {

    //TODO: Image upload logic ! 
    try {

        const session = await getServerSession(authOptions);

        if (!username?.trim()) throw new Error("No username provided");


        if (!session?.user) throw new Error("No session exists!");

        if (session.user.username) throw new Error("Onboarding is already done!");


        // append with previous session data, also append newImage (if it exists, otherwise use the previous one! )


    
        await ConnectDB();

        const newUser = { ...session.user, username: username, image: newImage || session.user.image };

        

        // check if user exists before !
        const doesExist = await Users.findOne({ username: username });

        if (doesExist) {
            throw new Error("DUPLICATE_USERNAME");
        }

        await Users.create(newUser);

        
        return { success: true };

    }
    catch (err) {


        // for all errors, except DUPLICATE_USER, show this ! 
        let errMsg: string = "An Unknown error occured !";


        if (err instanceof Error) {
            console.error("Error in onboarding process at CreateUser >>", err?.message);

            if (err?.message === "DUPLICATE_USERNAME") errMsg = "This Username is already taken! Please try a different one.";




        }

        return {
            success: false,
            errMsg: errMsg
        }




    }


}

export default CreateUser;