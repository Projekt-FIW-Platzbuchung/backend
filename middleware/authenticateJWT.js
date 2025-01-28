const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {

    console.log("Executing JWT middleware");  // Log zu Beginn der Middleware

    const token = req.header('Authorization')?.split(' ')[1];

    console.log("Token received:", token); // Log Token-Empfang

    if (!token){
        console.warn('Access Denied - No Token');
        return res.status(401).send('Access Denied');
    }

    try {
        const secret = 'yourjwtsecret'; // Geheimpunkt, um Token zu verschlüsseln/verifizieren
        const verified = jwt.verify(token, secret);

        console.log("Token verified:", verified); // Log bei erfolgreiche Verifizierung

        req.user = verified;
        next();
    } catch (err) {

        console.error("Token verification failed:", err.message); // Log Verifizierungsfehler

        res.status(400).send('Invalid Token');
    }
};

module.exports = authenticateJWT;
