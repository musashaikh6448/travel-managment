const store = require('../data/store');

const getAuditLogs = (req, res) => {
  try {
    const { module, action, search, page = 1, limit = 25 } = req.query;
    let logs = [...store.data.auditLogs];

    if (module && module !== 'all') {
      logs = logs.filter(l => l.module.toLowerCase() === module.toLowerCase());
    }
    if (action && action !== 'all') {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l => 
        l.user.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }

    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = logs.length;
    const p = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 25;
    const paginated = logs.slice((p - 1) * lim, p * lim);

    return res.json({
      success: true,
      total,
      page: p,
      totalPages: Math.ceil(total / lim),
      logs: paginated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
};

module.exports = {
  getAuditLogs
};
