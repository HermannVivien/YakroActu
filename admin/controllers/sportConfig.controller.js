const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sport configurations
const getAllSportConfigs = async (req, res) => {
  try {
    const configs = await prisma.sportConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching sport configs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Get active sport configuration
const getActiveSportConfig = async (req, res) => {
  try {
    const config = await prisma.sportConfig.findFirst({
      where: { isActive: true }
    });
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching active sport config:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Create sport configuration
const createSportConfig = async (req, res) => {
  try {
    const { apiProvider, apiKey, apiUrl, isActive, config } = req.body;

    // If setting as active, deactivate others
    if (isActive) {
      await prisma.sportConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const newConfig = await prisma.sportConfig.create({
      data: { apiProvider, apiKey, apiUrl, isActive, config }
    });

    res.status(201).json({ success: true, data: newConfig });
  } catch (error) {
    console.error('Error creating sport config:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Update sport configuration
const updateSportConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { apiProvider, apiKey, apiUrl, isActive, config } = req.body;

    // If setting as active, deactivate others
    if (isActive) {
      await prisma.sportConfig.updateMany({
        where: { isActive: true, NOT: { id: parseInt(id) } },
        data: { isActive: false }
      });
    }

    const updated = await prisma.sportConfig.update({
      where: { id: parseInt(id) },
      data: { apiProvider, apiKey, apiUrl, isActive, config }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating sport config:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Delete sport configuration
const deleteSportConfig = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sportConfig.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Configuration supprimée' });
  } catch (error) {
    console.error('Error deleting sport config:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllSportConfigs,
  getActiveSportConfig,
  createSportConfig,
  updateSportConfig,
  deleteSportConfig
};
