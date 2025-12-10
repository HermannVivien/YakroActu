const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSettings = async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' }
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: req.params.key }
    });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Paramètre non trouvé' });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { key, value, type, category } = req.body;
    
    if (!key || !value || !type) {
      return res.status(400).json({ success: false, message: 'key, value et type requis' });
    }

    const setting = await prisma.systemSetting.create({
      data: { key, value, type, category }
    });

    res.status(201).json({ success: true, message: 'Paramètre créé', data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { value, type, category } = req.body;

    const setting = await prisma.systemSetting.update({
      where: { key: req.params.key },
      data: {
        ...(value && { value }),
        ...(type && { type }),
        ...(category !== undefined && { category })
      }
    });

    res.json({ success: true, message: 'Paramètre mis à jour', data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    await prisma.systemSetting.delete({
      where: { key: req.params.key }
    });
    res.json({ success: true, message: 'Paramètre supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
