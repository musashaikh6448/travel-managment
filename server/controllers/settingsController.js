const store = require('../data/store');

const getSettings = (req, res) => {
  return res.json({
    success: true,
    settings: store.data.settings
  });
};

const updateSettings = (req, res) => {
  try {
    store.data.settings = {
      ...store.data.settings,
      ...req.body
    };
    store.save();

    store.logAudit(
      req.user?.name || 'Admin',
      req.user?.role || 'admin',
      'Updated Settings',
      'Settings',
      'Updated company settings and ticketing configuration',
      'settings'
    );

    return res.json({
      success: true,
      message: 'Settings saved successfully.',
      settings: store.data.settings
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
