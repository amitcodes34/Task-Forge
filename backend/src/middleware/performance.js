/**
 * Simple middleware to track request duration and log cache performance.
 */
const performanceLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Only log performance for GET /projects endpoints (list and detail)
    if (req.method === 'GET' && req.originalUrl.includes('/projects')) {
      const cacheStatus = res.getHeader('X-Cache') || 'MISS';
      console.log(`[CACHE ${cacheStatus}] ${req.method} ${req.originalUrl}  →  ${duration}ms`);
    }
  });

  next();
};

module.exports = performanceLogger;
