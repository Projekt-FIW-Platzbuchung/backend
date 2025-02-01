const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {

    console.log("Executing JWT middleware");  // Log zu Beginn der Middleware

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("Token received:", token); // Log Token-Empfang

    if (token == null){
        console.warn('Access Denied - No Token');
        return res.status(401).send('Access Denied - no token available');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);

        console.log("Token verified:", verified); // Log bei erfolgreiche Verifizierung

        req.user = verified;
        next(); // Token ist gültig
    } catch (err) {

        console.error("Token verification failed:", err.message); // Log Verifizierungsfehler

        res.status(403).send('Invalid Token'); // Token ist ungültig
    }
};

module.exports = authenticateJWT;
