import { Client } from 'revolt.js';
import express from 'express';
import bodyParser from 'body-parser';

const BOT_TOKEN = 'SEU_TOKEN_AQUI';
const CHANNEL_ID = 'CHANNEL_ID_AQUI';

const client = new Client();

client.loginBot(BOT_TOKEN);

client.on('ready', () => {
    console.log('🤖 Bot conectado ao Revolt!');
});

const app = express();
app.use(bodyParser.json());

app.post('/github', async (req, res) => {
    const event = req.headers['x-github-event'];

    if (event === 'push') {
        const repo = req.body.repository.full_name;
        const pusher = req.body.pusher.name;
        const branch = req.body.ref.replace('refs/heads/', '');
        const commits = req.body.commits;

        let message = `📌 Atualização no repositório **${repo}**!\n`;
        message += `👤 Push feito por: **${pusher}**\n`;
        message += `🌿 Branch: **${branch}**\n`;
        message += `📝 Commits:\n`;

        commits.forEach(commit => {
            message += `• ${commit.message} (${commit.id.substring(0, 7)})\n`;
        });

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.sendMessage(message);

        console.log("✅ Notificação enviada!");
    }

    res.status(200).send('OK');
});

// Porta onde o webhook irá ouvir
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Webhook escutando na porta ${PORT}`));