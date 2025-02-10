const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

/**
 * @swagger
 * /generate-token:
 *   get:
 *     summary: Generate a JWT token
 *     description: Generates a new JSON Web Token (JWT) for a predefined user. The token is created with a payload and signed using a secret key from the environment variables.
 *     tags:
 *       - auth
 *     responses:
 *       200:
 *         description: Successfully generated token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The generated JWT token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *       500:
 *         description: Server error while generating token.
 */

router.get('/generate-token', (req, res) => {

    try {

        const payload = {
            username: 'genericUser', 
        };

        const options = { expiresIn: '1h' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        
        res.send({ token });
    } catch(err) {
        console.error("Error generating token:", err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;