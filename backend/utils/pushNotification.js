import User from '../models/user.js';

/**
 * sendPushNotification
 * Sends a push notification via Expo's push API.
 * Automatically removes stale / unregistered push tokens from the DB.
 *
 * @param {string}  expoPushToken  - The recipient's Expo push token
 * @param {string}  title          - Notification title
 * @param {string}  body           - Notification body text
 * @param {object}  data           - Extra payload (navigated to on tap)
 * @param {string}  [userId]       - Optional user _id for stale-token cleanup
 */
export const sendPushNotification = async (expoPushToken, title, body, data = {}, userId = null) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    console.warn('sendPushNotification: invalid or missing push token, skipping.');
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'order-updates', // Android channel (registered in mobile app)
  };

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await res.json();

    // ── Stale token handling ──────────────────────────────────────
    // Expo returns a per-notification status; handle errors gracefully.
    const ticketData = result?.data;

    if (ticketData?.status === 'error') {
      const details = ticketData.details || {};

      if (
        ticketData.message?.includes('DeviceNotRegistered') ||
        details.error === 'DeviceNotRegistered' ||
        details.fault === 'developer'
      ) {
        console.warn(`Push token stale (DeviceNotRegistered): ${expoPushToken}`);
        await removeStaleToken(expoPushToken, userId);
      } else {
        console.error('Expo push error:', ticketData.message);
      }
    }

    return result;
  } catch (err) {
    console.error('Failed to send push notification:', err.message);
  }
};

/**
 * sendPushNotificationsBatch
 * Sends multiple notifications in a single Expo batch request (up to 100).
 * Automatically strips stale tokens from the DB after receiving receipts.
 *
 * @param {Array<{ token, title, body, data, userId }>} notifications
 */
export const sendPushNotificationsBatch = async (notifications) => {
  if (!notifications || notifications.length === 0) return [];

  const valid = notifications.filter(
    (n) => n.token && n.token.startsWith('ExponentPushToken')
  );

  if (valid.length === 0) return [];

  const messages = valid.map((n) => ({
    to:        n.token,
    sound:     'default',
    title:     n.title,
    body:      n.body,
    data:      n.data || {},
    priority:  'high',
    channelId: 'order-updates',
  }));

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await res.json();
    const tickets = Array.isArray(result?.data) ? result.data : [];

    // Identify and remove stale tokens
    const staleCleanups = [];
    tickets.forEach((ticket, i) => {
      if (
        ticket?.status === 'error' &&
        (
          ticket.message?.includes('DeviceNotRegistered') ||
          ticket.details?.error === 'DeviceNotRegistered'
        )
      ) {
        const { token, userId } = valid[i];
        console.warn(`Batch: stale push token detected: ${token}`);
        staleCleanups.push(removeStaleToken(token, userId));
      }
    });

    if (staleCleanups.length > 0) {
      await Promise.allSettled(staleCleanups);
    }

    return tickets;
  } catch (err) {
    console.error('Failed to send batch push notifications:', err.message);
    return [];
  }
};

/**
 * removeStaleToken
 * Clears a push token from the user document when Expo reports it as stale.
 * Tries by userId first; falls back to querying by token value.
 *
 * @param {string} token
 * @param {string|null} userId
 */
export const removeStaleToken = async (token, userId = null) => {
  try {
    if (userId) {
      await User.findByIdAndUpdate(userId, { pushToken: '' });
      console.log(`Removed stale push token for user ${userId}`);
    } else {
      // Fallback: find the user that owns this token and clear it
      const result = await User.updateOne({ pushToken: token }, { pushToken: '' });
      if (result.modifiedCount > 0) {
        console.log(`Removed stale push token (by token lookup): ${token}`);
      }
    }
  } catch (err) {
    console.error('Failed to remove stale push token:', err.message);
  }
};