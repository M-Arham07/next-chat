import mongoose from "mongoose"
// this function will throw an error if connection not succeded ! 
// it will be catched by the try catch block!

// if succeeded then will return true

export default async function ConnectDB(): Promise<void> {

    try {
       
        // if already connected, return !

        if(mongoose.connection.readyState === 1) return;
       




        if(!process.env.DB_URI) throw new Error("No DB URI Provided");

    
        await mongoose.connect(process.env.DB_URI);

        
        return;

    }
    catch (err) {


        if (err instanceof Error) {
            console.log("Failed to connect to MongoDB at connect-db.ts >> ", err?.message);
        }

        throw err;


    }





}