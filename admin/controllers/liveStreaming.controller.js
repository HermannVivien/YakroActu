const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLiveStreams = async (req, res) => {
  try {
    const { isLive } = req.query;
    const where = {};
    if (isLive !== undefined) where.isLive = isLive === 'true';

    const streams = await prisma.liveStreaming.findMany({
      where,
      orderBy: { startTime: 'desc' }
    });

    res.json({ success: true, data: streams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLiveStream = async (req, res) => {
  try {
    const { title, description, streamUrl, thumbnailUrl, isLive, startTime, endTime } = req.body;
    
    if (!title || !streamUrl) {
      return res.status(400).json({ success: false, message: 'Titre et URL requis' });
    }

    const stream = await prisma.liveStreaming.create({
      data: {
        title,
        description,
        streamUrl,
        thumbnailUrl,
        isLive: isLive || false,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null
      }
    });

    res.status(201).json({ success: true, message: 'Live créé', data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLiveStream = async (req, res) => {
  try {
    const { title, description, streamUrl, thumbnailUrl, isLive, startTime, endTime, viewCount } = req.body;

    const stream = await prisma.liveStreaming.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(streamUrl && { streamUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(isLive !== undefined && { isLive }),
        ...(startTime !== undefined && { startTime: startTime ? new Date(startTime) : null }),
        ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
        ...(viewCount !== undefined && { viewCount })
      }
    });

    res.json({ success: true, message: 'Live mis à jour', data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLiveStream = async (req, res) => {
  try {
    await prisma.liveStreaming.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Live supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
