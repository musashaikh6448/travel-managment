const store = require('../data/store');

const getAllRoutes = (req, res) => {
  try {
    const { search, status } = req.query;
    let routes = [...store.data.routes];

    if (status && status !== 'all') {
      routes = routes.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      routes = routes.filter(r => 
        r.routeName.toLowerCase().includes(q) ||
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q)
      );
    }

    const enrichedRoutes = routes.map(r => {
      const buses = store.data.buses.filter(b => b.routeId === r.id);
      const trips = store.data.trips.filter(t => t.routeId === r.id);
      const bookings = store.data.bookings.filter(b => b.routeId === r.id && b.status === 'Confirmed');
      const revenue = bookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

      return {
        ...r,
        assignedBusesCount: buses.length,
        totalTripsCount: trips.length,
        totalTicketsSold: bookings.length,
        totalRevenue: revenue
      };
    });

    return res.json({ success: true, count: enrichedRoutes.length, routes: enrichedRoutes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch routes.' });
  }
};

const getRouteById = (req, res) => {
  try {
    const { id } = req.params;
    const route = store.data.routes.find(r => r.id === id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    const buses = store.data.buses.filter(b => b.routeId === route.id);
    const trips = store.data.trips.filter(t => t.routeId === route.id);
    const bookings = store.data.bookings.filter(b => b.routeId === route.id && b.status === 'Confirmed');
    const revenue = bookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

    return res.json({
      success: true,
      route: {
        ...route,
        buses,
        trips: trips.slice(-10),
        stats: {
          busesCount: buses.length,
          tripsCount: trips.length,
          totalTickets: bookings.length,
          totalRevenue: revenue
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get route details.' });
  }
};

const createRoute = (req, res) => {
  try {
    const { routeName, from, to, stops, distance, estimatedTravelTime, startingTime, endingTime, ticketPrice, status } = req.body;
    if (!from || !to || !ticketPrice) {
      return res.status(400).json({ success: false, message: 'Origin (From), Destination (To), and Ticket Price are required.' });
    }

    const name = routeName || `${from} ➔ ${to} Express`;
    const newRoute = {
      id: `route_${Date.now()}`,
      routeName: name,
      from: from.trim(),
      to: to.trim(),
      stops: Array.isArray(stops) ? stops : (stops ? stops.split(',').map(s => s.trim()) : [from, to]),
      distance: distance || '250 km',
      estimatedTravelTime: estimatedTravelTime || '5 hrs',
      startingTime: startingTime || '20:00',
      endingTime: endingTime || '05:00',
      ticketPrice: parseFloat(ticketPrice),
      status: status || 'Active',
      createdAt: new Date().toISOString()
    };

    store.data.routes.push(newRoute);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Created Route', 'Route', `Added route ${newRoute.routeName} (₹${newRoute.ticketPrice})`, newRoute.id);

    return res.status(201).json({ success: true, message: 'Route created successfully.', route: newRoute });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create route.' });
  }
};

const updateRoute = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.data.routes.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    const current = store.data.routes[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      ticketPrice: req.body.ticketPrice !== undefined ? parseFloat(req.body.ticketPrice) : current.ticketPrice,
      stops: req.body.stops ? (Array.isArray(req.body.stops) ? req.body.stops : req.body.stops.split(',').map(s => s.trim())) : current.stops
    };

    store.data.routes[index] = updated;
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Updated Route', 'Route', `Updated route ${updated.routeName}`, updated.id);

    return res.json({ success: true, message: 'Route updated successfully.', route: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update route.' });
  }
};

const deleteRoute = (req, res) => {
  try {
    const { id } = req.params;
    const route = store.data.routes.find(r => r.id === id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    const assignedBuses = store.data.buses.filter(b => b.routeId === id);
    if (assignedBuses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete route: ${assignedBuses.length} bus(es) are currently assigned to it.`
      });
    }

    store.data.routes = store.data.routes.filter(r => r.id !== id);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Deleted Route', 'Route', `Deleted route ${route.routeName}`, id);

    return res.json({ success: true, message: `Route ${route.routeName} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete route.' });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};
