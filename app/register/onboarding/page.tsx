"use client";

import { useSession } from "next-auth/react";

export default function Hi() {

    const { data: session } = useSession();

    return <h1>This is the onboarding page {session?.user.username}</h1>
   



}