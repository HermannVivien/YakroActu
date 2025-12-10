const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10, isVerified } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.author.count({ where })
    ]);

    res.json({
      success: true,
      data: authors,
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

exports.getAuthorById = async (req, res) => {
  try {
    const author = await prisma.author.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!author) {
      return res.status(404).json({ success: false, message: 'Auteur non trouvé' });
    }
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const { userId, bio, website, twitter, facebook, linkedin, specialties, isVerified } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId requis' });
    }

    const author = await prisma.author.create({
      data: { userId: parseInt(userId), bio, website, twitter, facebook, linkedin, specialties, isVerified: isVerified || false }
    });

    res.status(201).json({ success: true, message: 'Auteur créé', data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const { bio, website, twitter, facebook, linkedin, specialties, isVerified } = req.body;

    const author = await prisma.author.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(twitter !== undefined && { twitter }),
        ...(facebook !== undefined && { facebook }),
        ...(linkedin !== undefined && { linkedin }),
        ...(specialties !== undefined && { specialties }),
        ...(isVerified !== undefined && { isVerified })
      }
    });

    res.json({ success: true, message: 'Auteur mis à jour', data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    await prisma.author.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Auteur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
