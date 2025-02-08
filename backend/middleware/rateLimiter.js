import { rateLimit } from "express-rate-limit";

// Limit to 3 recipe search requests per day per IP

export const searchLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  limit: 5,
  handler: (req, res) => {
    console.log("Rate limit hit by:", req.ip);
    res.status(429).json({
      error:
        "For demo purposes only 3 requests allowed per day. Try again tomorrow.",
    });
  },
});
