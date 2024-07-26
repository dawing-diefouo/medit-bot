const OpenAIApi = require('openai');
require('dotenv').config();

const openai = new OpenAIApi(
    {apiKey: process.env.OPENAI_API_KEY}
);

async function testOpenAI() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'system', content:'du bist ein 50-jähriger erfahrener Arzt und muss einen eigegebenen Befund sehr einfach erklären'},
                { role: 'user', content: 'Hello, ich habe Kopfschmerzen?' }],
        });
        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error('Fehler beim Abrufen der Antwort von ChatGPT:', error);
    }
}

testOpenAI();
