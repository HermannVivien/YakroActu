const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllConfigs = async (req, res) => {
  try {
    const { platform, isActive } = req.query;
    const where = {};
    if (platform) where.platform = platform;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const configs = await prisma.appConfig.findMany({
      where,
      orderBy: [{ platform: 'asc' }, { configKey: 'asc' }]
    });

    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConfigsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const configs = await prisma.appConfig.findMany({
      where: {
        platform: platform.toUpperCase(),
        isActive: true
      }
    });

    const configObject = {};
    configs.forEach(config => {
      configObject[config.configKey] = config.configValue;
    });

    res.json({ success: true, data: configObject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createConfig = async (req, res) => {
  try {
    const { platform, configKey, configValue, description, isActive } = req.body;
    
    if (!platform || !configKey || !configValue) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const config = await prisma.appConfig.create({
      data: {
        platform,
        configKey,
        configValue,
        description,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json({ success: true, message: 'Configuration créée', data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { configValue, description, isActive } = req.body;

    const config = await prisma.appConfig.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(configValue && { configValue }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ success: true, message: 'Configuration mise à jour', data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteConfig = async (req, res) => {
  try {
    await prisma.appConfig.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Configuration supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
