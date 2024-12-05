const jwt = require('jsonwebtoken');

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract Bearer token

  if (!token) {
    return res.status(403).send('Token is required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded;  // Attach decoded user info to request
    console.log('Token is valid, user:', req.user); // Log user information
    next();
  });
}

module.exports = { verifyToken };
