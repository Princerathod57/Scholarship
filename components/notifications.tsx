"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetMessages } from "@/app/features/messages";
import { useMarkMessageRead } from "@/app/features/messages";
import { useDeleteMessage } from "@/app/features/messages";
import { cn } from "@/lib/utils";

export function Notifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Get the current user's ID for notifications
  const currentUserId = user?.id;
  
  // Get all messages for notifications - only use the authenticated user's ID
  const { data: messagesData, error: messagesError, isLoading: messagesLoading } = useGetMessages(currentUserId, false);
  const markAsRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();
  
  // Handle messages data safely
  const allMessages = messagesData?.data || [];
  // Filter unread messages to show count in the bell icon
  const unreadMessages = allMessages.filter((msg: any) => !msg.read && msg.recipientId === currentUserId);
  let unreadCount = unreadMessages.length;

  // Only show for authenticated users
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "px-2 py-2 rounded-xl transition-all duration-300 flex items-center justify-center relative min-w-fit flex-shrink-0 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-950/50 dark:hover:to-blue-900/50 hover:shadow-md hover:scale-105 border border-transparent hover:border-blue-300/50 dark:hover:border-blue-600/50",
            unreadCount > 0 && "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50"
          )}
          title="Notifications"
        >
          <div className="relative flex items-center justify-center">
            <Bell className="h-5 w-5 transition-all duration-300" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Messages</h3>
          <p className="text-sm text-muted-foreground">
            {messagesLoading ? "Loading..." : 
             allMessages.length === 0 ? "No messages" :
             `${allMessages.length} total, ${unreadCount} unread`}
          </p>
        </div>
        {messagesLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : messagesError ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Error loading notifications</p>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {allMessages.map((message: any) => (
              <div
                key={message.id}
                className={`p-3 border-b last:border-b-0 ${
                  !message.read ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!message.read ? 'font-semibold' : 'font-medium'}`}>
                        {message.subject}
                      </p>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {message.sender?.name || "Unknown"}
                      {message.read && <span className="ml-2 opacity-60">• Read</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{new Date(message.createdAt).toLocaleDateString()}</div>
                      <div className="font-mono">{new Date(message.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="flex gap-1">
                      {!message.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead.mutate(message.id);
                          }}
                          title="Mark as read"
                        >
                          <div className="w-3 h-3 border border-blue-500 rounded-full"></div>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage.mutate(message.id);
                        }}
                        title="Delete message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
