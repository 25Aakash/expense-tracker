const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // limit each IP to 10 requests per minute
  message: {
    error: 'Too many requests — please wait a minute and try again.',
  },
  standardHeaders: true,  
  legacyHeaders: false,
});

module.exports = limiter;   