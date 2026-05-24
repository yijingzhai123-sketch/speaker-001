const { getSession } = require('../routes/auth');

function authMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'development') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const sessionId = authHeader.replace('Bearer ', '');
  const session = getSession(sessionId);
  if (!session) { req.sessionValid = false; } else { req.sessionValid = true; req.openid = session.openid; }
  next();
}

module.exports = authMiddleware;
