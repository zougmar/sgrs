import { useState, useEffect, useRef, useCallback } from 'react';
import { contactAPI } from '../../services/api';

const useMessageNotifications = (pollInterval = 30000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const intervalRef = useRef(null);
  const previousUnreadRef = useRef(0);
  const lastCheckTimeRef = useRef(null);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const response = await contactAPI.getAll();
      const contacts = response.data.data || [];
      const unread = contacts.filter((c) => !c.isRead);
      const unreadCount = unread.length;

      // Check if there are new messages since last check
      if (lastCheckTimeRef.current) {
        const newMessagesSinceLastCheck = unread.filter((contact) => {
          const contactDate = new Date(contact.createdAt);
          return contactDate > lastCheckTimeRef.current;
        });

        if (newMessagesSinceLastCheck.length > 0) {
          setNewMessages((prev) => [...newMessagesSinceLastCheck, ...prev].slice(0, 5));
        }
      }

      // Check if unread count increased
      if (unreadCount > previousUnreadRef.current && previousUnreadRef.current > 0) {
        // New message received
        const latestUnread = unread
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 1);
        if (latestUnread.length > 0) {
          setNewMessages((prev) => [latestUnread[0], ...prev].slice(0, 5));
        }
      }

      setUnreadCount(unreadCount);
      previousUnreadRef.current = unreadCount;
      lastCheckTimeRef.current = new Date();
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchUnreadMessages();

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchUnreadMessages();
    }, pollInterval);

    // Listen for message read events
    const handleMessageRead = () => {
      fetchUnreadMessages();
    };
    window.addEventListener('messageRead', handleMessageRead);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('messageRead', handleMessageRead);
    };
  }, [pollInterval, fetchUnreadMessages]);

  const clearNewMessages = () => {
    setNewMessages([]);
  };

  const refreshMessages = () => {
    fetchUnreadMessages();
  };

  return {
    unreadCount,
    newMessages,
    clearNewMessages,
    refreshMessages,
  };
};

export default useMessageNotifications;
