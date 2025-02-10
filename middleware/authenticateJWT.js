const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a JSON Web Token (JWT).
 *
 * This middleware checks the Authorization header for a valid JWT.
 * If the token is valid, it adds the decoded token data to the request object.
 * Otherwise, it responds with an authentication error.
 *
 * @function authenticateJWT
 * @memberof module:auth
 * @param {Object} req - The Express request object, which should include the Authorization header.
 * @param {Object} res - The Express response object, used to send back status and error messages.
 * @param {Function} next - A callback to signal Express to move on to the next middleware or route handler.
 * @returns {void} Sends a 401 status if no token is present, or a 403 status if the token is invalid.
 */

const authenticateJWT = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null){
        console.warn('Access Denied - No Token');
        return res.status(401).send('Access Denied - no token available');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);

        req.user = verified;
        next(); 
    } catch (err) {

        console.error("Token verification failed:", err.message); 

        res.status(403).send('Invalid Token'); 
    }
};

module.exports = authenticateJWT;
