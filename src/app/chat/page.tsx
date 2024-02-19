'use client';

import Conversation from "@/app/chat/conversation";
import TRPCProvider from "@/app/_trpc/Provider";

export default function Page() {
  return (
    <TRPCProvider>
      <Conversation />
    </TRPCProvider>
  );
}