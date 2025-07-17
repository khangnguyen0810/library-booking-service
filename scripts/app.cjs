require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({api_key: process.env.GEMINI_API_KEY});


// async function main() {
//   const response = await ai.models.generateContent({
//     model: 'gemini-2.5-pro',
//     contents: 'Viết Hello World bằng Python',
//   });
//   console.log(response.text);
// }
// main()

const path = require('path');
const connectDB = require('./server/db.js')
const Room = require('./server/models/Room');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

let cachedRooms = [];


connectDB().then((rooms) => {
  cachedRooms = rooms;
})

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

    // Validate that 'available' is a boolean
    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, message: '`available` must be true or false.' });
    }

    const result = await Room.updateOne(
      { id: roomId },
      { $set: { available: available } }
    );

    // if (result.modifiedCount === 0) {
    //   return res.status(404).json({ success: false, message: 'Room not found or already in that state.' });
    // }

    res.json({ success: true, message: `Room ${roomId} availability updated to ${available}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update availability.' });
  }
});

// ✅ POST AI route with Gemini Integration

// Initialize the API with your API key

app.post('/api/ai', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Generate content
    const result = await model.generateContent(message);
    const textResponse = result.response.text();

    res.json({ success: true, response: textResponse });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI response.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
