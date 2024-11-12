require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');

// console.log(typeof routes); // Dies zeigt an, ob es sich um ein Objekt, eine Funktion, etc. handelt
// console.log(routes); // Dies gibt dir zusätzliche Informationen und zeigt das tatsächliche, importierte Objekt/Funktion


const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use('/', routes); 

mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
    .then(() => console.log(`Erfolgreich mit der Datenbank verbunden ${process.env.DB_NAME}`))
    .catch(err => console.error(`Fehler bei der Datenbankverbindung:${process.env.DB_NAME}`, err));

app.listen(PORT, (error) => {
    if (error) {
        console.error('Serverstart fehlgeschlagen:', error);
    } else {
        console.log(`Server läuft auf ${PORT}`);
    }
});