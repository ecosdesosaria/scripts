import { Client } from "stoat.js";

const BOT_TOKEN = 'XXXXXXXXXXXXX';
const CHANNEL_FOFOCA = 'XXXXXXXXXXXXX';

// Message passed from CLI arguments
const message = process.argv.slice(2).join(" ");
if (!message) {
    console.error("Nenhuma mensagem para enviar!");
    process.exit(1);
}

const client = new Client({
    apiURL: "https://app.revolt.chat/api",
    eventURL: "wss://app.revolt.chat/events?compression=false&encoding=json"
});

async function run() {
    try {
        await client.loginBot(BOT_TOKEN);
        const channel = await client.channels.fetch(CHANNEL_FOFOCA);
        await channel.sendMessage(message);
        console.log("✅ Mensagem enviada ao canal FOFOCA");
    } catch (err) {
        console.error("❌ Erro ao enviar mensagem:", err);
    } finally {
        process.exit(0);
    }
}

run();
