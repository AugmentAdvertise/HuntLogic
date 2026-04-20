"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <div className="-mx-4 -my-4 flex flex-col md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-6">
      <div className="h-[calc(100dvh-8.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-[28rem] md:h-[calc(100dvh-10rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] lg:h-[calc(100dvh-3rem)]">
        <ChatContainer />
      </div>
    </div>
  );
}
