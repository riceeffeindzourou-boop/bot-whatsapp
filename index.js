const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    
    if (body.messages && body.messages.length > 0) {
      const message = body.messages[0];
      const userText = message.kapso.content;
      const userPhone = message.kapso.from;
      const phoneNumberId = message.kapso.phoneNumberId;

      console.log("Message recu de " + userPhone + ": " + userText);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userText }],
      });

      const gptResponse = completion.choices[0].message.content;

      await fetch('https://kapso.ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.KAPSO_API_KEY
        },
        body: JSON.stringify({
          phoneNumberId: phoneNumberId,
          to: userPhone,
          type: 'text',
          text: { body: gptResponse }
        })
      });

      console.log("Reponse envoyee a " + userPhone);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur detectee :", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur actif sur le port " + PORT));