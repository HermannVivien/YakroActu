const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMenus = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const menus = await prisma.websiteMenu.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { name, slug, parentId, link, icon, order, isActive, isExternal, target } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nom et slug requis' });
    }

    const menu = await prisma.websiteMenu.create({
      data: {
        name,
        slug,
        parentId: parentId ? parseInt(parentId) : null,
        link,
        icon,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        isExternal: isExternal || false,
        target
      }
    });

    res.status(201).json({ success: true, message: 'Menu créé', data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, slug, parentId, link, icon, order, isActive, isExternal, target } = req.body;

    const menu = await prisma.websiteMenu.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(parentId !== undefined && { parentId: parentId ? parseInt(parentId) : null }),
        ...(link !== undefined && { link }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        ...(isExternal !== undefined && { isExternal }),
        ...(target !== undefined && { target })
      }
    });

    res.json({ success: true, message: 'Menu mis à jour', data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await prisma.websiteMenu.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Menu supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
