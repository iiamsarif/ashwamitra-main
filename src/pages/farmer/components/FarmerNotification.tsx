import React from "react";
import { Bell, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useApi";

const FarmerNotification = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  const notificationList = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 sm:p-6 rounded-2xl text-white shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
            <p className="text-sm opacity-90">Stay updated with your farm activity</p>
          </div>
        </div>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          {notificationList.filter((n: any) => !n.isRead).length} unread
        </span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm divide-y">
        {notificationList.map((note: any) => (
          <div 
            key={note._id || note.id} 
            className={`p-4 sm:p-5 hover:bg-green-50 transition flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 cursor-pointer ${!note.isRead ? 'bg-green-50/50' : ''}`}
            onClick={() => !note.isRead && handleMarkRead(note._id || note.id)}
          >
            <div className="flex items-start gap-3">
              {!note.isRead && <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{note.title || note.message}</p>
                <p className="text-xs text-gray-600 mt-0.5">{note.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                </p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
              note.type === "payment_received" ? "bg-blue-100 text-blue-700" :
              note.type === "approval" ? "bg-green-100 text-green-700" :
              note.type === "order_update" ? "bg-purple-100 text-purple-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {note.type?.replace(/_/g, " ") || "info"}
            </span>
          </div>
        ))}
        {notificationList.length === 0 && (
          <div className="p-8 text-center text-gray-400">No notifications yet</div>
        )}
      </div>
    </div>
  );
};

export default FarmerNotification;
