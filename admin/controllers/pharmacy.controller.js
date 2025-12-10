const prisma = require('../config/prisma');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, onDuty, search } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (onDuty !== undefined) where.isOnDuty = onDuty === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { commune: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [pharmacies, total] = await Promise.all([
      prisma.pharmacy.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.pharmacy.count({ where })
    ]);

    res.json({
      success: true,
      data: pharmacies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude requises'
      });
    }

    // Calcul simple de distance (à améliorer avec une vraie fonction de géolocalisation)
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    const nearby = pharmacies.filter(pharmacy => {
      const distance = Math.sqrt(
        Math.pow(parseFloat(latitude) - pharmacy.latitude, 2) +
        Math.pow(parseFloat(longitude) - pharmacy.longitude, 2)
      ) * 111; // Approximation en km

      return distance <= parseFloat(radius);
    });

    res.json({
      success: true,
      data: { pharmacies: nearby }
    });
  } catch (error) {
    next(error);
  }
};

const getOnDuty = async (req, res, next) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      where: { isOnDuty: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { pharmacies }
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacie non trouvée'
      });
    }

    res.json({
      success: true,
      data: { pharmacy }
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      name,
      address,
      commune,
      phone,
      latitude,
      longitude,
      openingHours,
      isOnDuty
    } = req.body;

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        address,
        commune,
        phone,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        openingHours,
        isOnDuty: isOnDuty || false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pharmacie créée',
      data: { pharmacy }
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      commune,
      phone,
      latitude,
      longitude,
      openingHours,
      isOnDuty
    } = req.body;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(commune && { commune }),
        ...(phone && { phone }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(openingHours && { openingHours }),
        ...(isOnDuty !== undefined && { isOnDuty })
      }
    });

    res.json({
      success: true,
      message: 'Pharmacie mise à jour',
      data: { pharmacy }
    });
  } catch (error) {
    next(error);
  }
};

const deletePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.pharmacy.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Pharmacie supprimée'
    });
  } catch (error) {
    next(error);
  }
};

const toggleOnDuty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: parseInt(id) }
    });

    const updated = await prisma.pharmacy.update({
      where: { id: parseInt(id) },
      data: { isOnDuty: !pharmacy.isOnDuty }
    });

    res.json({
      success: true,
      message: updated.isOnDuty ? 'Pharmacie de garde activée' : 'Pharmacie de garde désactivée',
      data: { pharmacy: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rechercher des pharmacies
 */
const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre de recherche "q" est requis'
      });
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { commune: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' },
      take: 20
    });

    res.json({
      success: true,
      data: pharmacies
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getNearby,
  getOnDuty,
  search,
  getById,
  create,
  update,
  delete: deletePharmacy,
  toggleOnDuty
};
