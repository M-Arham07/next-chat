"use client"

import { useSession } from "next-auth/react"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { useLoader } from "@/store/loader/use-loader";

export default function Home() {
    const { data: session,status } = useSession();
    const {setLoading} = useLoader();
   setLoading(status === "authenticated" ? false : true);

    return <h1>Hi {session?.user.username}</h1>

}