require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({ api_key: process.env.GEMINI_API_KEY });

const path = require('path');
const connectDB = require('./server/db.js');
const Room = require('./server/models/Room');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

let cachedRooms = [];

// Initialize AI chat session at startup
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
let chatSession = model.startChat({ history: [] });

connectDB().then((rooms) => {
  cachedRooms = rooms;
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/api/rooms', (req, res) => {
  res.json(cachedRooms);
});

app.put('/api/rooms/:id/available', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, message: '`available` must be true or false.' });
    }

    const result = await Room.updateOne(
      { id: roomId },
      { $set: { available: available } }
    );

    res.json({ success: true, message: `Room ${roomId} availability updated to ${available}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update availability.' });
  }
});

// ✅ POST AI route with persistent chat session
app.post('/api/ai', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const result = await chatSession.sendMessage(message);
    const textResponse = result.response.text();

    res.json({ success: true, response: textResponse });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI response.' });
  }
});

app.post('/api/ai/reset', (req, res) => {
  try {
    chatSession = model.startChat({ history: [] });  // ✅ Recreate new session
    res.json({ success: true, message: 'Chat session has been reset.' });
  } catch (error) {
    console.error('Failed to reset chat session:', error);
    res.status(500).json({ success: false, error: 'Failed to reset chat session.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
