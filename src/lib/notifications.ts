export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  });
}

export function scheduleReminder(title: string, body: string, timeMs: number) {
  return setTimeout(() => {
    sendNotification(title, body);
  }, timeMs);
}
