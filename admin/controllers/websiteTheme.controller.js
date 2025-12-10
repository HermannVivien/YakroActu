const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllThemes = async (req, res) => {
  try {
    const themes = await prisma.websiteTheme.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: themes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveTheme = async (req, res) => {
  try {
    const theme = await prisma.websiteTheme.findFirst({
      where: { isActive: true }
    });
    
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Aucun thème actif' });
    }

    res.json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTheme = async (req, res) => {
  try {
    const { name, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, fontFamily, logoUrl, faviconUrl, customCss, isActive } = req.body;
    
    if (!name || !primaryColor || !secondaryColor) {
      return res.status(400).json({ success: false, message: 'Nom et couleurs requis' });
    }

    const theme = await prisma.websiteTheme.create({
      data: {
        name,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        fontFamily,
        logoUrl,
        faviconUrl,
        customCss,
        isActive: isActive || false
      }
    });

    res.status(201).json({ success: true, message: 'Thème créé', data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.activateTheme = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.websiteTheme.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    const theme = await prisma.websiteTheme.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });

    res.json({ success: true, message: 'Thème activé', data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTheme = async (req, res) => {
  try {
    await prisma.websiteTheme.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Thème supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
