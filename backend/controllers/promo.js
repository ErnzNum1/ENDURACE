import User from '../models/user.js';
import { sendPushNotificationsBatch } from '../utils/pushNotification.js';

// ── Admin: broadcast a promotion notification to all users ────────
export const broadcastPromotion = async (req, res) => {
  try {
    const { title, body, discountCode } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'title and body are required' });
    }

    // Fetch all users who have a valid push token
    const users = await User.find({
      pushToken: { $exists: true, $ne: '' },
      isActive: true,
    }).select('_id pushToken');

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users with push tokens found.',
        sent: 0,
      });
    }

    // Build batch payload — include userId so stale tokens get removed automatically
    const notifications = users.map((u) => ({
      token:  u.pushToken,
      userId: u._id.toString(),
      title,
      body,
      data: {
        screen:       'Promotion',
        discountCode: discountCode || null,
      },
    }));

    // Send via the batched helper (handles stale-token cleanup internally)
    const tickets = await sendPushNotificationsBatch(notifications);

    const sent   = tickets.filter((t) => t?.status === 'ok').length;
    const failed = tickets.filter((t) => t?.status === 'error').length;
    // Count unchanged (in case Expo didn't return per-ticket data)
    const total  = users.length;

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sent || total} user${(sent || total) !== 1 ? 's' : ''}.`,
      sent:   sent || total,
      failed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};