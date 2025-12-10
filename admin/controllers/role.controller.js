const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { staff: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        staff: true
      }
    });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Rôle non trouvé' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    if (!name || !permissions) {
      return res.status(400).json({ success: false, message: 'Nom et permissions requis' });
    }

    const role = await prisma.role.create({
      data: { name, description, permissions }
    });

    res.status(201).json({ success: true, message: 'Rôle créé', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await prisma.role.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions })
      }
    });

    res.json({ success: true, message: 'Rôle mis à jour', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await prisma.role.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Rôle supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
