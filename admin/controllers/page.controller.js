const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.page.count({ where })
    ]);

    res.json({
      success: true,
      data: pages,
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

exports.getPageById = async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { title, slug, content, status, metaTitle, metaDesc } = req.body;
    
    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const page = await prisma.page.create({
      data: { title, slug, content, status: status || 'DRAFT', metaTitle, metaDesc }
    });

    res.status(201).json({ success: true, message: 'Page créée', data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { title, slug, content, status, metaTitle, metaDesc } = req.body;

    const page = await prisma.page.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        ...(status && { status }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc })
      }
    });

    res.json({ success: true, message: 'Page mise à jour', data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    await prisma.page.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Page supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
