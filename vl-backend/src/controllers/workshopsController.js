const prisma = require('../db');

// GET /api/workshops
const getWorkshops = async (req, res) => {
  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } }
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
        // vl_manager and admin create approved workshops; coordinator creates pending
        status: (req.user.role === 'admin' || req.user.role === 'vl_manager') ? 'approved' : 'pending'
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
    const { title, description, date, status, location, mode, seats, formSchema } = req.body;

    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id }
    });

    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'vl_manager' && existingWorkshop.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions to update this workshop' });
    }

    const data = {};
    if (title) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (date) data.date = new Date(date);
    if (location !== undefined) data.location = location;
    if (mode !== undefined) data.mode = mode;
    if (seats !== undefined) data.seats = parseInt(seats);
    if (formSchema !== undefined) data.formSchema = formSchema;
    
    // Admins and VL Managers can approve/reject workshops
    if (status && (req.user.role === 'admin' || req.user.role === 'vl_manager')) {
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

// DELETE /api/workshops/:id
const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id }
    });

    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'vl_manager' && existingWorkshop.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this workshop' });
    }

    await prisma.workshop.delete({
      where: { id }
    });

    res.json({ message: 'Workshop deleted successfully' });
  } catch (err) {
    console.error('Delete workshop error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/workshops/:id
const getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json(workshop);
  } catch (err) {
    console.error('Get workshop by id error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getWorkshops, getWorkshopById, createWorkshop, updateWorkshop, deleteWorkshop };
