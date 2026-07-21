const prisma = require('../db');

// GET /api/workshops
const getWorkshops = async (req, res) => {
  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    });
    res.json(workshops);
  } catch (err) {
    console.error('Get workshops error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/workshops
const createWorkshop = async (req, res) => {
  try {
    const { title, description, date, location, mode, seats } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const workshop = await prisma.workshop.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        date: new Date(date),
        location: location ? location.trim() : null,
        mode: mode || 'Online',
        seats: seats ? parseInt(seats) : null,
        createdById: req.user.id,
        // vl_manager creates pending workshops; admin creates approved ones
        status: req.user.role === 'admin' ? 'approved' : 'pending'
      }
    });

    res.status(201).json(workshop);
  } catch (err) {
    console.error('Create workshop error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/workshops/:id
const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, status, location, mode, seats } = req.body;

    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id }
    });

    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (req.user.role !== 'admin' && existingWorkshop.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions to update this workshop' });
    }

    const data = {};
    if (title) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (date) data.date = new Date(date);
    if (location !== undefined) data.location = location;
    if (mode !== undefined) data.mode = mode;
    if (seats !== undefined) data.seats = parseInt(seats);
    
    // Only admins can approve/reject workshops, or change status
    if (status && req.user.role === 'admin') {
        data.status = status;
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data
    });

    res.json(workshop);
  } catch (err) {
    console.error('Update workshop error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getWorkshops, createWorkshop, updateWorkshop };
