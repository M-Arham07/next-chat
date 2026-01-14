"use client";
import { MessageBubble } from "./_components/message-bubble";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "sonner";

const Index = () => {


  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
       
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Message Bubble Demo</h1>
          <ThemeToggle />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          💡 Swipe messages to reply (swipe right on others' messages, left on your own)
        </p>
        
        {/* Variant 1: Without reply */}
        <MessageBubble
          type="text"
          content="Acknowledged"
          senderName="Ibraheem"
          timestamp="11:19 AM"
          messageId="msg-1"
        />

        {/* Variant 2: With reply */}
        <MessageBubble
          type="text"
          content="Acknowledged"
          senderName="Ibraheem"
          timestamp="11:19 AM"
          replyMsgId="123"
          replyMessage={{
            repliedTo: "Noob",
            content: "No crap talk"
          }}
          messageId="msg-2"

        />

        {/* Own message (isMe) example */}
        <MessageBubble
          type="text"
          content="Sure, I'll check it out!"
          timestamp="11:20 AM"
          isMe={true}
          messageId="msg-3"
        
        />

        {/* Own message with reply */}
        <MessageBubble
          type="text"
          content='Hello World ("print")'
          timestamp="4:47 PM"
          isMe={true}
          replyMsgId="456"
          replyMessage={{
            repliedTo: "+92 332 6910247",
            content: "Check this message"
          }}
          messageId="msg-4"

        />

        {/* Document type */}
        <MessageBubble
          type="document"
          content="assignment_notes.pdf"
          senderName="Noob"
          timestamp="11:15 AM"
          messageId="msg-5"
    
        />

        {/* Voice type */}
        <MessageBubble
          type="voice"
          content="0:32"
          senderName="Ibraheem"
          timestamp="11:10 AM"
          messageId="msg-6"
        />
      </div>
    </div>
  );
};

export default Index;
