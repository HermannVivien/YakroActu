const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSurveys = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [surveys, total] = await Promise.all([
      prisma.survey.findMany({
        where,
        include: {
          _count: { select: { questions: true, responses: true } }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.survey.count({ where })
    ]);

    res.json({
      success: true,
      data: surveys,
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

exports.getSurveyById = async (req, res) => {
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } }
      }
    });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Sondage non trouvé' });
    }
    res.json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSurvey = async (req, res) => {
  try {
    const { title, description, status, startDate, endDate, questions } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Titre requis' });
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        status: status || 'DRAFT',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        questions: {
          create: questions || []
        }
      },
      include: { questions: true }
    });

    res.status(201).json({ success: true, message: 'Sondage créé', data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const { title, description, status, startDate, endDate } = req.body;

    const survey = await prisma.survey.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    res.json({ success: true, message: 'Sondage mis à jour', data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    await prisma.survey.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Sondage supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
