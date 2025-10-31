// imports
const dotenv = require("dotenv");
dotenv.config();

//used to get refresh token from google with oauth2
require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');

const app = express();
const PORT = 3001;
app.use(express.json());
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3001/oauth2callback";

console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET);

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

app.get('/', (req, res) => {
    console.log('🔴 Starting OAuth flow...');
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://mail.google.com/'
        ],
        prompt: 'consent'
    });
    console.log('✅ Redirecting to:', url);
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    console.log('📩 Received code from Google');
    
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('✅ Tokens received:', tokens);
        console.log('🔑 REFRESH TOKEN:', tokens.refresh_token);
        
        res.send('Success! Check your terminal for the refresh token.');
    } catch (error) {
        console.error('❌ Error retrieving tokens:', error);
        res.status(500).send('Error getting tokens. Check the console.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 OAuth server running on http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT} to start OAuth flow`);
});

