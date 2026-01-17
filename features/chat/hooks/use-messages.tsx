"use client";
import { createContext, useContext, useState,useEffect } from "react";
import { MessageState } from "../types/message-state";


export function useMessagesHook() : MessageState {

    const [messages, setMessages] = useState<MessageState | null>(null);


    // api call + loading logic here

    useEffect(()=>setMessages(mockThreadMessages),[]);
    



   




    return messages!;

   

   


}















































const mockThreadMessages: MessageState = {
    "t1": [
        { msgId: "m-01", threadId: "t1", sender: "alex_dev", type: "text", content: "Did you check the latest PR?", timestamp: new Date("2026-01-16T09:00:00Z"), readBy: "sam_manager" },
        { msgId: "m-02", threadId: "t1", sender: "sam_manager", type: "text", content: "Looking now. The auth logic seems off.", timestamp: new Date("2026-01-16T09:05:00Z"), reactions: "🤔" },
        { msgId: "m-03", threadId: "t1", sender: "alex_dev", type: "image", content: "https://cdn.debug.io/logs/error_stack.png", timestamp: new Date("2026-01-16T09:10:00Z") },
        { msgId: "m-04", threadId: "t1", sender: "sam_manager", type: "text", content: "Ah, I see it. It's a race condition.", timestamp: new Date("2026-01-16T09:12:00Z"), reactions: "✅" }
    ],
    "th-002": [
        { msgId: "m-05", threadId: "th-002", sender: "hr_jane", type: "text", content: "Please review the new health benefits doc.", timestamp: new Date("2026-01-15T14:00:00Z") },
        { msgId: "m-06", threadId: "th-002", sender: "hr_jane", type: "document", content: "https://corp.sharepoint.com/benefits_v2.pdf", timestamp: new Date("2026-01-15T14:01:00Z") },
        { msgId: "m-07", threadId: "th-002", sender: "user_karl", type: "text", content: "Thanks Jane, will do.", timestamp: new Date("2026-01-15T15:30:00Z"), readBy: "hr_jane" }
    ],
    "th-003": [
        { msgId: "m-08", threadId: "th-003", sender: "bot_monitor", type: "text", content: "Alert: Server CPU usage > 90%", timestamp: new Date("2026-01-16T11:00:00Z") },
        { msgId: "m-09", threadId: "th-003", sender: "dev_ops_will", type: "text", content: "I'm on it. Restarting the cluster.", timestamp: new Date("2026-01-16T11:02:00Z"), reactions: "🚀" },
        { msgId: "m-10", threadId: "th-003", sender: "bot_monitor", type: "text", content: "System status: Healthy.", timestamp: new Date("2026-01-16T11:15:00Z"), reactions: "🎉" }
    ],
    "th-004": [
        { msgId: "m-11", threadId: "th-004", sender: "marketing_liz", type: "voice", content: "https://storage.cloud.com/voice/campaign_idea.mp3", timestamp: new Date("2026-01-16T08:00:00Z") },
        { msgId: "m-12", threadId: "th-004", sender: "design_tom", type: "text", content: "Interesting vibe. Let's try it.", timestamp: new Date("2026-01-16T08:45:00Z"), readBy: "marketing_liz" }
    ],
    "th-005": [
        { msgId: "m-13", threadId: "th-005", sender: "user_22", type: "text", content: "Where are we meeting?", timestamp: new Date("2026-01-14T18:00:00Z") },
        { msgId: "m-14", threadId: "th-005", sender: "user_23", type: "text", content: "The lobby lounge.", timestamp: new Date("2026-01-14T18:02:00Z"), reactions: "📍" },
        { msgId: "m-15", threadId: "th-005", sender: "user_22", type: "text", content: "Cool, see ya.", timestamp: new Date("2026-01-14T18:05:00Z") }
    ],
    "th-006": [
        { msgId: "m-16", threadId: "th-006", sender: "ceo_mike", type: "text", content: "Great work this quarter, team!", timestamp: new Date("2026-01-16T10:00:00Z"), reactions: "👏,👏,🔥" },
        { msgId: "m-17", threadId: "th-006", sender: "vp_sara", type: "text", content: "Couldn't have done it without everyone.", timestamp: new Date("2026-01-16T10:05:00Z"), readBy: "ceo_mike" },
        { msgId: "m-18", threadId: "th-006", sender: "alex_dev", type: "text", content: "Let's keep it going!", timestamp: new Date("2026-01-16T10:10:00Z") },
        { msgId: "m-19", threadId: "th-006", sender: "design_tom", type: "image", content: "https://media.giphy.com/party_cat.gif", timestamp: new Date("2026-01-16T10:12:00Z") }
    ],
    "th-007": [
        { msgId: "m-20", threadId: "th-007", sender: "sales_nina", type: "document", content: "https://files.com/contracts/client_x.pdf", timestamp: new Date("2026-01-13T12:00:00Z") },
        { msgId: "m-21", threadId: "th-007", sender: "legal_claire", type: "text", content: "Clauses 4 and 5 need adjustment.", timestamp: new Date("2026-01-13T14:30:00Z") }
    ],
    "th-008": [
        { msgId: "m-22", threadId: "th-008", sender: "user_01", type: "text", content: "Lunch?", timestamp: new Date("2026-01-16T12:00:00Z") },
        { msgId: "m-23", threadId: "th-008", sender: "user_02", type: "text", content: "Tacos?", timestamp: new Date("2026-01-16T12:01:00Z"), reactions: "🌮" },
        { msgId: "m-24", threadId: "th-008", sender: "user_03", type: "text", content: "I'm in for tacos.", timestamp: new Date("2026-01-16T12:02:00Z") }
    ],
    "th-009": [
        { msgId: "m-25", threadId: "th-009", sender: "support_tech", type: "text", content: "Ticket #404 resolved.", timestamp: new Date("2026-01-12T09:00:00Z"), reactions: "🛠️" },
        { msgId: "m-26", threadId: "th-009", sender: "customer_44", type: "text", content: "Thanks for the quick help!", timestamp: new Date("2026-01-12T10:00:00Z") }
    ],
    "th-010": [
        { msgId: "m-27", threadId: "th-010", sender: "sam_manager", type: "voice", content: "https://voice.storage/briefing_jan16.m4a", timestamp: new Date("2026-01-16T08:30:00Z") },
        { msgId: "m-28", threadId: "th-010", sender: "alex_dev", type: "text", content: "Understood. Starting on the refactor.", timestamp: new Date("2026-01-16T09:15:00Z") }
    ],
    "th-011": [
        { msgId: "m-29", threadId: "th-011", sender: "user_j", type: "text", content: "Happy Friday!", timestamp: new Date("2026-01-16T09:00:00Z"), reactions: "✨,🥂" },
        { msgId: "m-30", threadId: "th-011", sender: "user_b", type: "text", content: "You too!", timestamp: new Date("2026-01-16T09:02:00Z") }
    ],
    "th-012": [
        { msgId: "m-31", threadId: "th-012", sender: "security_bot", type: "text", content: "Unusual login detected: IP 192.168.1.1", timestamp: new Date("2026-01-16T03:00:00Z") },
        { msgId: "m-32", threadId: "th-012", sender: "it_admin", type: "text", content: "Verified, that was me on VPN.", timestamp: new Date("2026-01-16T08:00:00Z"), reactions: "👌" }
    ],
    "th-013": [
        { msgId: "m-33", threadId: "th-013", sender: "writer_a", type: "text", content: "Draft for the blog post.", timestamp: new Date("2026-01-10T11:00:00Z") },
        { msgId: "m-34", threadId: "th-013", sender: "writer_a", type: "document", content: "https://docs.google.com/draft_1", timestamp: new Date("2026-01-10T11:01:00Z") },
        { msgId: "m-35", threadId: "th-013", sender: "editor_b", type: "text", content: "Solid intro, but shorten the second paragraph.", timestamp: new Date("2026-01-10T14:00:00Z"), readBy: "writer_a" }
    ],
    "th-014": [
        { msgId: "m-36", threadId: "th-014", sender: "user_x", type: "image", content: "https://cdn.photos/sunset.jpg", timestamp: new Date("2026-01-11T18:30:00Z"), reactions: "🌅" },
        { msgId: "m-37", threadId: "th-014", sender: "user_y", type: "text", content: "Stunning!", timestamp: new Date("2026-01-11T19:00:00Z") }
    ],
    "th-015": [
        { msgId: "m-38", threadId: "th-015", sender: "qa_lead", type: "text", content: "Bug found in v1.2 stage.", timestamp: new Date("2026-01-16T11:45:00Z") },
        { msgId: "m-39", threadId: "th-015", sender: "qa_lead", type: "image", content: "https://bugtracker.io/screenshot_99.png", timestamp: new Date("2026-01-16T11:46:00Z") },
        { msgId: "m-40", threadId: "th-015", sender: "alex_dev", type: "text", content: "Fixing now. It's a CSS overflow issue.", timestamp: new Date("2026-01-16T11:55:00Z"), reactions: "🔧" }
    ],
    "th-016": [
        { msgId: "m-41", threadId: "th-016", sender: "recruiter_z", type: "text", content: "Can you interview a candidate at 2pm?", timestamp: new Date("2026-01-16T10:00:00Z") },
        { msgId: "m-42", threadId: "th-016", sender: "sam_manager", type: "text", content: "Yes, send the invite.", timestamp: new Date("2026-01-16T10:15:00Z"), readBy: "recruiter_z" }
    ],
    "th-017": [
        { msgId: "m-43", threadId: "th-017", sender: "user_p", type: "text", content: "Don't forget the milk.", timestamp: new Date("2026-01-16T07:30:00Z") },
        { msgId: "m-44", threadId: "th-017", sender: "user_q", type: "text", content: "Got it.", timestamp: new Date("2026-01-16T17:00:00Z"), reactions: "🥛" }
    ],
    "th-018": [
        { msgId: "m-45", threadId: "th-018", sender: "news_bot", type: "text", content: "Breaking: AI passes the Turing Test again.", timestamp: new Date("2026-01-16T06:00:00Z") },
        { msgId: "m-46", threadId: "th-018", sender: "user_m", type: "text", content: "Wild times.", timestamp: new Date("2026-01-16T08:00:00Z"), reactions: "🤖" }
    ],
    "th-019": [
        { msgId: "m-47", threadId: "th-019", sender: "user_a", type: "text", content: "Test msg 1", timestamp: new Date("2026-01-16T12:10:00Z") },
        { msgId: "m-48", threadId: "th-019", sender: "user_b", type: "text", content: "Test msg 2", timestamp: new Date("2026-01-16T12:11:00Z") }
    ],
    "th-020": [
        { msgId: "m-49", threadId: "th-020", sender: "user_z", type: "text", content: "Final check for the day.", timestamp: new Date("2026-01-16T12:14:00Z") },
        { msgId: "m-50", threadId: "th-020", sender: "user_a", type: "text", content: "All clear.", timestamp: new Date("2026-01-16T12:15:00Z"), reactions: "🌙" }
    ]
};

