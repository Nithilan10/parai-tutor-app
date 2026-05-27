import prisma from "./prisma";

/**
 * Preload critical data for better performance
 * Use these functions for frequently accessed data
 */

/**
 * Get all nilais with beats, optimized with eager loading
 * @param {Object} options
 * @param {boolean} options.includeBeatProgress - Include user progress
 * @param {string} options.userId - User ID for progress
 */
export async function getAllNilaisOptimized({ includeBeatProgress = false, userId = null } = {}) {
  const include = {
    beats: {
      orderBy: { order: 'asc' },
      ...(includeBeatProgress && userId ? {
        include: {
          userProgress: {
            where: { userId },
            take: 1,
          },
        },
      } : {}),
    },
  };

  return await prisma.nilai.findMany({
    include,
    orderBy: { order: 'asc' },
  });
}

/**
 * Get single nilai by ID with optimized relations
 */
export async function getNilaiByIdOptimized(nilaiId, userId = null) {
  return await prisma.nilai.findUnique({
    where: { id: nilaiId },
    include: {
      beats: {
        orderBy: { order: 'asc' },
        ...(userId ? {
          include: {
            userProgress: {
              where: { userId },
              take: 1,
            },
          },
        } : {}),
      },
    },
  });
}

/**
 * Get user's progress efficiently
 */
export async function getUserProgressOptimized(userId) {
  return await prisma.userBeatProgress.findMany({
    where: { userId },
    include: {
      beat: {
        include: {
          nilai: {
            select: {
              id: true,
              name: true,
              order: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Get user stats efficiently (cached for short duration)
 */
let statsCache = new Map();
const STATS_CACHE_TTL = 30000; // 30 seconds

export async function getUserStatsOptimized(userId) {
  const cacheKey = `stats_${userId}`;
  const cached = statsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < STATS_CACHE_TTL) {
    return cached.data;
  }

  const [totalProgress, completedBeats, totalBeats] = await Promise.all([
    prisma.userBeatProgress.count({
      where: { userId },
    }),
    prisma.userBeatProgress.count({
      where: { userId, status: 'completed' },
    }),
    prisma.beat.count(),
  ]);

  const stats = {
    totalProgress,
    completedBeats,
    totalBeats,
    completionPercentage: totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0,
  };

  statsCache.set(cacheKey, {
    timestamp: Date.now(),
    data: stats,
  });

  return stats;
}

/**
 * Clear stats cache for a user (call after progress update)
 */
export function clearUserStatsCache(userId) {
  statsCache.delete(`stats_${userId}`);
}

/**
 * Preload all tutorial data in one query
 */
export async function getAllTutorialsOptimized() {
  return await prisma.tutorial.findMany({
    include: {
      nilais: {
        include: {
          beats: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get forum posts with efficient pagination
 */
export async function getForumPostsPaginated({ page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      skip,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.forumPost.count(),
  ]);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Batch update beat progress (more efficient than individual updates)
 */
export async function batchUpdateBeatProgress(updates) {
  if (!Array.isArray(updates) || updates.length === 0) return;

  const operations = updates.map(({ userId, beatId, status }) =>
    prisma.userBeatProgress.upsert({
      where: {
        userId_beatId: { userId, beatId },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        userId,
        beatId,
        status,
      },
    })
  );

  await prisma.$transaction(operations);
  
  // Clear cache for affected users
  const userIds = [...new Set(updates.map(u => u.userId))];
  userIds.forEach(clearUserStatsCache);
}

/**
 * Clean up old cache entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of statsCache.entries()) {
    if (now - value.timestamp > STATS_CACHE_TTL * 2) {
      statsCache.delete(key);
    }
  }
}, 60000); // Clean up every minute
