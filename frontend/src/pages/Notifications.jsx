import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Notifications = () => {
  const mockNotifications = [
    {
      id: 1,
      type: 'like',
      user: 'John Doe',
      content: 'liked your post',
      time: '2m ago',
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: 'Jane Smith',
      content: 'commented on your post',
      time: '1h ago',
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: 'Mike Johnson',
      content: 'started following you',
      time: '3h ago',
      read: true
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="text-pink-500" size={20} />;
      case 'comment':
        return <MessageCircle className="text-blue-500" size={20} />;
      case 'follow':
        return <UserPlus className="text-green-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-500" size={24} />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {mockNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
            <Bell size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-gray-500 text-sm">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4 hover:bg-gray-900/70 transition-colors cursor-pointer ${
                  !notification.read ? 'border-blue-500/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-semibold">{notification.user}</span>
                      {' '}
                      <span className="text-gray-400">{notification.content}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
