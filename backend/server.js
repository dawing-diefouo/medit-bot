

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const  OpenAI = require('openai');

const app = express();
require('dotenv').config();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer Konfiguration zum Hochladen von Dateien
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OpenAI API Konfiguration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// system prompt
const instructions =[
    { role: 'system',
        content:'du bist ein 50-jähriger erfahrener Arzt und muss einen eigegebenen Befund sehr einfach erklären'
    }
];

// Route zum Hochladen und Analysieren von PDF-Dateien
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.message)
    if (!req.file) {
        return res.status(400).send('Keine Datei hochgeladen');
    }

    try {
        const data = await pdfParse(req.file.buffer);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [...instructions, {
                role: "user",
                content: data.text
            }],
        });

        const botMessage = response.choices[0].message.content;
        console.log(botMessage);
        res.json({ botMessage });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Route für ChatGPT
app.post('/chat', async (req, res) => {
    const {messages } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [...instructions, ...messages],
        });

        const botMessage = response.choices[0].message.content;
        res.json({ botMessage });
    } catch (error) {
        res.status(500).send('Fehler beim Abrufen der Antwort von ChatGPT');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
