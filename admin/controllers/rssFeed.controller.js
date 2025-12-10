const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRssFeeds = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const feeds = await prisma.rssFeed.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: feeds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRssFeed = async (req, res) => {
  try {
    const { name, url, categoryId, isActive } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Nom et URL requis' });
    }

    const feed = await prisma.rssFeed.create({
      data: {
        name,
        url,
        categoryId: categoryId ? parseInt(categoryId) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json({ success: true, message: 'Flux RSS créé', data: feed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRssFeed = async (req, res) => {
  try {
    const { name, url, categoryId, isActive, lastFetched } = req.body;

    const feed = await prisma.rssFeed.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(lastFetched !== undefined && { lastFetched: lastFetched ? new Date(lastFetched) : null })
      }
    });

    res.json({ success: true, message: 'Flux RSS mis à jour', data: feed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRssFeed = async (req, res) => {
  try {
    await prisma.rssFeed.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Flux RSS supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
