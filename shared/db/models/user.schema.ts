import { UserInterface } from "../../types";
import mongoose  from "mongoose";



// Omit _id,createdAt,updatedAt as it already exists in mongoose.Schema

export type UserSchemaType = Omit<UserInterface, "_id" | "createdAt" | "updatedAt">;

const UserSchema = new mongoose.Schema<UserSchemaType>({

    name: {
        type: String,
        required: true,
    },


    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true,

    }



}, { timestamps: true });


export const User = mongoose.models.User || mongoose.model<UserSchemaType>("User", UserSchema);