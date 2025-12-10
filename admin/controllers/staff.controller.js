const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllStaffMembers = async (req, res) => {
  try {
    const { isActive, department, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (department) where.department = department;

    const [staff, total] = await Promise.all([
      prisma.staffMember.findMany({
        where,
        include: {
          role: { select: { id: true, name: true } }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.staffMember.count({ where })
    ]);

    res.json({
      success: true,
      data: staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStaffMemberById = async (req, res) => {
  try {
    const staff = await prisma.staffMember.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { role: true }
    });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Membre non trouvé' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaffMember = async (req, res) => {
  try {
    const { userId, roleId, department, position, hireDate, isActive } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ success: false, message: 'userId et roleId requis' });
    }

    const staff = await prisma.staffMember.create({
      data: {
        userId: parseInt(userId),
        roleId: parseInt(roleId),
        department,
        position,
        hireDate: hireDate ? new Date(hireDate) : null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: { role: true }
    });

    res.status(201).json({ success: true, message: 'Membre créé', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStaffMember = async (req, res) => {
  try {
    const { roleId, department, position, hireDate, isActive } = req.body;

    const staff = await prisma.staffMember.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(roleId && { roleId: parseInt(roleId) }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(hireDate !== undefined && { hireDate: hireDate ? new Date(hireDate) : null }),
        ...(isActive !== undefined && { isActive })
      },
      include: { role: true }
    });

    res.json({ success: true, message: 'Membre mis à jour', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStaffMember = async (req, res) => {
  try {
    await prisma.staffMember.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Membre supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
