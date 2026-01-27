import { Message } from "@chat/shared"


export interface MessageState {
    [key:string] : Message[]
}

// eg "thread_id" : [msg1,msg2,msgN] 