// =============================================================================
// src/controllers/freelancer.controller.js
// =============================================================================
// Returns all freelancers with an AI-simulated match score.
// Access: CLIENT only (enforced in route middleware).
// =============================================================================

const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get all freelancers with AI match score
 * @route   GET /api/v1/freelancers
 * @access  Private - CLIENT
 */
const getFreelancers = async (req, res, next) => {
  try {
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        isEmailVerified: true,
        isBanned: false,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        skills: true,
        bio: true,
        topRated: true,
        hourlyRate: true,
        createdAt: true,
        reviewsReceived: {
          select: { rating: true },
        },
        _count: {
          select: { bids: true, deliveries: true },
        },
      },
    });

    // Compute avgRating and completedJobs, then add AI match score
    const scored = freelancers.map(f => {
      const reviews = f.reviewsReceived || [];
      const avgRating = reviews.length > 0
        ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
      const completedJobs = f._count?.deliveries || 0;

      // AI heuristic score (0-99)
      let score = avgRating * 10;                         // 0-50
      score += Math.min(completedJobs * 2, 30);           // up to 30
      if (f.topRated) score += 10;                        // 0 or 10
      score += Math.floor(Math.random() * 9);             // 0-9 random factor
      score = Math.min(Math.round(score), 99);
      score = Math.max(score, 55);                        // floor at 55 for presentation

      return {
        id: f.id,
        firstName: f.firstName,
        lastName: f.lastName,
        skills: f.skills || [],
        bio: f.bio || null,
        topRated: f.topRated,
        hourlyRate: f.hourlyRate ? Number(f.hourlyRate) : 0,
        avgRating,
        reviewCount: reviews.length,
        completedJobs,
        aiMatchScore: score,
      };
    });

    // Sort: highest score first
    scored.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    ApiResponse.success(res, 200, 'Freelancers retrieved successfully.', { freelancers: scored });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFreelancers };
