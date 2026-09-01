const jwt = require('jsonwebtoken');

// Protects a route: requires a valid "Authorization: Bearer <token>" header.
// On success, attaches the decoded payload (e.g. { id: userId }) to req.user.
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided. Send "Authorization: Bearer <token>".',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // jwt.verify() throws on missing/expired/tampered tokens — must be caught,
    // otherwise it crashes the server instead of returning a clean 401.
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

module.exports = auth;
