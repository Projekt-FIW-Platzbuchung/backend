const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

router.get('/generate-token', (req, res) => {

    try {
        console.log('Generating token...');  

        const payload = {
            username: 'genericUser', 
        };

        const options = { expiresIn: '1h' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);

        console.log("Token generated:", token); 

        res.send({ token });
    } catch(err) {
        console.error("Error generating token:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;