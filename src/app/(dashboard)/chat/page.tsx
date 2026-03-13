"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col lg:h-dvh">
      <ChatContainer />
    </div>
  );
}
