const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { queryAgent } = require('./openaiAgent');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const result = await queryAgent(question);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// app.get('/ping', (req, res) => {
//   res.json({ message: 'pong' });
// });
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

