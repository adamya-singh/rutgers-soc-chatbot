"use client";
import React from "react";
import Chat from "./chat";
import useConversationStore from "@/stores/useConversationStore";
import useFiltersStore from "@/stores/useFiltersStore";
import { Item, processMessages } from "@/lib/assistant";

export default function Assistant() {
  const { chatMessages, addConversationItem, addChatMessage } =
    useConversationStore();
  const { selectedDescription, selectedMeetingDay, selectedStartTime, selectedEndTime } = useFiltersStore();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Create filter context string
    const descText = selectedDescription || 'Any';
    const dayText = selectedMeetingDay || 'Any';
    const startTimeText = selectedStartTime || 'Any';
    const endTimeText = selectedEndTime || 'Any';
    const filterContext = `[Selected Campus: ${descText}, Selected Day: ${dayText}, Selected Start Time: ${startTimeText}, Selected End Time: ${endTimeText}]\n\n`;

    // Add filter context to the message
    const messageWithContext = `${filterContext}${message.trim()}`;

    const userItem: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: messageWithContext }],
    };
    const userMessage: any = {
      role: "user",
      content: messageWithContext,
    };

    try {
      addConversationItem(userMessage);
      addChatMessage(userItem);
      await processMessages();
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <div className="h-full p-4 w-full bg-white">
      <Chat items={chatMessages} onSendMessage={handleSendMessage} />
    </div>
  );
}
