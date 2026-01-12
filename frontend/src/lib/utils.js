const notificationAudio =
  typeof window !== "undefined" ? new Audio("/notification.mp3") : null;
if (notificationAudio) notificationAudio.volume = 0.5;

export function formatMessageTime(date) {
  try {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (err) {
    return "--:--";
  }
}

/**
 * Formats relative time (e.g., 5m, 2h, 1d)
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";
  const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

/**
 * Detailed "Last Seen" status
 */
export const formatLastSeen = (date) => {
  if (!date) return "long ago";
  const lastSeenDate = new Date(date);
  const diffInSeconds = Math.floor((new Date() - lastSeenDate) / 1000);

  if (diffInSeconds < 60) return "just now";

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return lastSeenDate.toLocaleDateString();
};

export const playNotificationSound = () => {
  if (!notificationAudio) return;

  try {
    notificationAudio.currentTime = 0;

    const playPromise = notificationAudio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch (err) {}
};
