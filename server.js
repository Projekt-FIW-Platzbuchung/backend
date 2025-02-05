require('dotenv').config();
const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
require('./tasks/cronjob_delete_old_bookings');

const app = express();
const PORT = process.env.PORT
const swaggerSetup = require("./doku/swagger/swagger");
swaggerSetup(app);


const authenticateJWT = require('./middleware/authenticateJWT');
const generateTokenRoute = require('./generateToken');

app.use(express.json());
//app.use(cors());
app.use(cors({
    origin: 'http://localhost:4200', // Passen Sie die Quelle entsprechend Ihrer Entw.-Umgebung an
    credentials: true // falls nötig
}));
console.log('Setting up routes');  // Log zur Bestätigung der Routeninitialisierung

app.use('/', routes);


// Verwendet die Middleware auf den gewünschten Routen
app.use('/protected', authenticateJWT, routes); // Beispiel: `routes` ist der Import einer Beispiel Route-Konfiguration

app.use((req, res, next) => {
    console.log(`Received a ${req.method} request to ${req.url}`);
    next();
});

app.use('/', generateTokenRoute); 

app.get('/protected-route', authenticateJWT, (req, res) => {
    console.log('Accessing protected route');  // Log bei Zugriff auf die geschützte Route

    res.send('This is a protected route accessible only with a valid token');
}); 

mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
    .then(() => console.log(`Erfolgreich mit der Datenbank verbunden ${process.env.DB_NAME}`))
    .catch(err => console.error(`Fehler bei der Datenbankverbindung:${process.env.DB_NAME}`, err));

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, (error) => {
        if (error) {
            console.error('Serverstart fehlgeschlagen:', error);
        } else {
            console.log(`Server läuft auf ${PORT}`);
        }
    });
}

module.exports = app;