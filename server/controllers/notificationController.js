const store = require('../data/store');

const getNotifications = (req, res) => {
  try {
    const role = req.user?.role || 'worker';
    const notifs = store.data.notifications.filter(n => 
      n.targetRole === 'all' || 
      n.targetRole === role || 
      (role === 'superadmin')
    );

    const unreadCount = notifs.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: notifs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      store.data.notifications.forEach(n => { n.isRead = true; });
    } else {
      const notif = store.data.notifications.find(n => n.id === id);
      if (notif) notif.isRead = true;
    }

    store.save();
    return res.json({ success: true, message: 'Notifications updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
