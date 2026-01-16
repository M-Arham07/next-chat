


export type ThreadType = "direct" | "group"; // DM to someone, or a group chat



// particpant(s) in the thread!
interface particpant {

    username: string,
    image: string,
    role: "admin" | "member" // if private chat, then role can only be member (or just keep it null?)

    // these fields are required if its a group
    joinedAt?: Date | null,
    leftAt?: Date | null


}
export interface Thread {
    threadId: string,
    type: ThreadType,
    particpants: particpant[],

    createdAt: Date,
    //These are required if thread is a group!
    createdBy?: string,
    groupName?: string,
    groupImage?: string
}

// In the app (frotnend and backend), we'll store threads and messages separately!