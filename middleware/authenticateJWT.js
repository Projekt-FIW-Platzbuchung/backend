const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {

    console.log("Executing JWT middleware");  

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("Token received:", token); 

    if (token == null){
        console.warn('Access Denied - No Token');
        return res.status(401).send('Access Denied - no token available');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);

        console.log("Token verified:", verified); 

        req.user = verified;
        next(); 
    } catch (err) {

        console.error("Token verification failed:", err.message); 

        res.status(403).send('Invalid Token'); 
    }
};

module.exports = authenticateJWT;
