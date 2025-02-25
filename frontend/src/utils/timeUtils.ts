export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0 && seconds !== 60) {
    return `${minutes}m ago`;
  } else if (seconds === 60) {
    return '60s ago';
  } else if (seconds >= 30) {
    return `${seconds}s ago`;
  } else {
    return 'just now';
  }
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If message is from today, show only time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // If message is from this year, show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}
