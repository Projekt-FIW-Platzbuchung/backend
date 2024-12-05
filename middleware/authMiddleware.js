const jwt = require('jsonwebtoken');

// Middleware to verify custom JWT token (the one you generate)
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract Bearer token

  if (!token) {
    return res.status(403).send('Token is required');
  }

  // Verify the custom JWT token using the same secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }

    req.user = decoded;  // Attach decoded user info to the request
    console.log('Token is valid, user:', req.user);  // Log user information
    next();  // Call the next middleware or route handler
  });
}

module.exports = { verifyToken };
