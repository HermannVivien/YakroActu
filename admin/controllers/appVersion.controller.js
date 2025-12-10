const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllVersions = async (req, res) => {
  try {
    const { platform, status } = req.query;
    const where = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const versions = await prisma.appVersion.findMany({
      where,
      orderBy: [{ platform: 'asc' }, { buildNumber: 'desc' }]
    });

    res.json({ success: true, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatestVersion = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const version = await prisma.appVersion.findFirst({
      where: {
        platform: platform.toUpperCase(),
        status: 'ACTIVE'
      },
      orderBy: { buildNumber: 'desc' }
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'Version non trouvée' });
    }

    res.json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVersion = async (req, res) => {
  try {
    const { platform, version, buildNumber, status, releaseNotes, minVersion, forceUpdate, downloadUrl } = req.body;
    
    if (!platform || !version || !buildNumber) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const appVersion = await prisma.appVersion.create({
      data: {
        platform,
        version,
        buildNumber: parseInt(buildNumber),
        status: status || 'ACTIVE',
        releaseNotes,
        minVersion,
        forceUpdate: forceUpdate || false,
        downloadUrl
      }
    });

    res.status(201).json({ success: true, message: 'Version créée', data: appVersion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVersion = async (req, res) => {
  try {
    const { status, releaseNotes, minVersion, forceUpdate, downloadUrl } = req.body;

    const appVersion = await prisma.appVersion.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(status && { status }),
        ...(releaseNotes !== undefined && { releaseNotes }),
        ...(minVersion !== undefined && { minVersion }),
        ...(forceUpdate !== undefined && { forceUpdate }),
        ...(downloadUrl !== undefined && { downloadUrl })
      }
    });

    res.json({ success: true, message: 'Version mise à jour', data: appVersion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVersion = async (req, res) => {
  try {
    await prisma.appVersion.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Version supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
