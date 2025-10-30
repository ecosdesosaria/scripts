import { Client } from 'stoat.js';
import express from 'express';
import bodyParser from 'body-parser';

const BOT_TOKEN = 'BOT_TOKEN';
const CHANNEL_ID = 'CHANNEL_ID';
const client = new Client();


client.on('error', (err) => {
    console.error('❌ Stoat.js Client Error:', err);
});

await client.loginBot(BOT_TOKEN);

   
client.on('ready', async () => {
    try {
        console.log('🤖 Bot conectado ao Stoat!');
        const channel = await client.channels.fetch(CHANNEL_ID);
        console.log(`📌 Canal encontrado: ${channel.name}`);

	    // await channel.sendMessage('✅ Teste via Stoat.js! 🎉');
	
        console.log('✅ Mensagem enviada com sucesso!');
    } catch (err) {
        console.error('❌ Erro no ready handler:', err);
    }
});


/*
	try {
        console.log('🤖 Bot conectado ao Stoat!');
        await client.messages.create({
            channel: CHANNEL_ID,
            content: '✅ Teste via Stoat.js! 🎉'
        });
        console.log('✅ Mensagem enviada com sucesso!');
    } catch (err) {
        console.error('❌ Erro no ready handler:', err);
  }
  */
  /*  try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        console.log(`📌 Canal encontrado: ${channel.name}`);

        await channel.sendMessage("✅ Teste via Stoat.js! 🎉");
        console.log("✅ Mensagem enviada com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao enviar:", err);
    } */
 

const app = express();
app.use(bodyParser.json());

app.post('/github', async (req, res) => {
    const event = req.headers['x-github-event'];

    if (event === 'ping') {
        console.log("✅ Webhook ping recebido do GitHub!");
        return res.status(200).send('Pong! ✅');
    }

    if (event === 'push') {
        const repo = req.body.repository.full_name;
        const pusher = req.body.pusher.name;
        const branch = req.body.ref.replace('refs/heads/', '');
	// const commits = req.body.commits;

        let message = `📌 Atualização no repositório **${repo}**!\n`;
        message += `👤 Push feito por: **${pusher}**\n`;
        message += `🌿 Branch: **${branch}**\n`;
        message += `📝 Commits:\n`;

        /* commits.forEach(commit => {
            message += `• ${commit.message} (${commit.id.substring(0, 7)})\n`;
        });*/

	for (const commit of req.body.commits) {
            message += `— ${commit.message} (${commit.id.substring(0, 7)})\n`;
        }

	/*
	try {
    		await client.messages.create({
        	channel: CHANNEL_ID,
        	content: message
    		});
    	console.log("✅ Notificação enviada!");
	} catch (err) {
    		console.error("❌ Erro ao enviar mensagem:", err);
		}
	
        return res.status(200).send('OK');
    }

    // Fallback for unknown events
    res.status(200).send('Evento ignorado ✅');
}); */
    try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            await channel.sendMessage(message);
            console.log("✅ Push notificado!");
        } catch (err) {
            console.error("❌ Erro ao enviar push:", err);
        }

        return res.status(200).send("OK ✅");
    }

    return res.status(200).send("Ignorado ✅");
});

// Porta onde o webhook irá ouvir
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Webhook escutando na porta ${PORT}`));

//client.loginBot(BOT_TOKEN).catch(console.error);
