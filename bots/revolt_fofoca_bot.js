// ⚔️ FOFOCA Bot — Crônicas de Sosaria (Monitoramento de Eventos)
import { Client } from "stoat.js";
import fs from "fs/promises";

const FOFOCA_BOT_TOKEN = 'XXXXXXXXXXXX';
const CHANNEL_TAVERNA = 'XXXXXXXXXXXX';
const CHANNEL_FOFOCA = 'XXXXXXXXXXXX';

const ONLINE_FILE = "/home/ubuntu/ecos-server/World/Saves/Data/online.txt";
const ADVENTURES_FILE = "/home/ubuntu/ecos-server/World/Saves/Data/adventures.txt";
const DEATHS_FILE = "/home/ubuntu/ecos-server/World/Saves/Data/deaths.txt";

const CHECK_INTERVAL = 10 * 1000; // 10s

let lastAdventureLine = "";
let lastDeathLine = "";

// Limpa o nome removendo tudo depois de " the "
function cleanName(name) {
    const idx = name.indexOf(" the ");
    return idx !== -1 ? name.substring(0, idx).trim() : name.trim();
}

// Mensagens de morte — estilo medieval, neutras em gênero
const deathMessages = [
    "{v} encontrou seu fim diante de {k}.",
    "{v} tombou em combate contra {k}.",
    "{v} caiu perante o poder de {k}.",
    "{v} teve sua jornada encerrada por {k}.",
    "{v} foi derrotado em batalha por {k}.",
    "{v} sucumbiu diante de {k}.",
    "{v} foi vencido na disputa contra {k}.",
    "{v} viu sua chama se apagar pelas mãos de {k}.",
    "{v} não resistiu à força de {k}.",
    "{v} foi abatido pela fúria de {k}.",
    "{v} teve seu destino selado por {k}.",
    "A lenda de {v} encontrou um fim diante de {k}.",
    "Nada pôde salvar {v} da derrota imposta por {k}.",
];

// Mensagens de chegada ao reino
const arrivalMessages = [
    "{n} adentrou os portões do reino.",
    "{n} chega ao reino, pronto para novas histórias.",
    "{n} retorna às terras de Sosaria.",
    "O reino testemunha a presença de {n} mais uma vez.",
    "{n} atravessa os limites do reino e surge entre nós.",
    "{n} chega para escrever novos capítulos nesta terra.",
    "O vento anuncia a chegada de {n} ao reino.",
    "Ecos do reino proclamam o retorno de {n}.",
    "Os portões se abrem para {n}.",
];

// Mensagens de saída do reino
const departureMessages = [
    "{n} deixa o reino e parte rumo ao desconhecido.",
    "{n} abandona estas terras em silêncio.",
    "{n} encerra sua presença por ora.",
    "As estradas chamam por {n}, que parte do reino.",
    "{n} se retira para longe das muralhas do reino.",
    "Estas terras agora ficam sem {n}.",
    "{n} segue adiante, longe de Sosaria.",
    "Os portões se fecham atrás de {n}.",
    "{n} deixa apenas memórias ao partir.",
];

// Lê jogadores online
async function readOnlinePlayers() {
    try {
        const data = await fs.readFile(ONLINE_FILE, "utf-8");
        return data.split("\n").filter(l => l.trim()).map(cleanName);
    } catch {
        return [];
    }
}

// Processa deaths.txt
async function checkDeaths(client) {
    try {
        const content = await fs.readFile(DEATHS_FILE, "utf-8");
        const lines = content.split("\n").filter(l => l.trim());
        if (!lines.length) return;

        const firstLine = lines[0];
        if (!firstLine || firstLine === lastDeathLine) return;
        lastDeathLine = firstLine;

        const [text] = firstLine.split("#");
        if (!text.includes("had been killed by")) return;

        const [victimPart, killerPart] = text.split(" had been killed by ");
        const victim = cleanName(victimPart);
        const killer = cleanName(killerPart);

        const template = deathMessages[Math.floor(Math.random() * deathMessages.length)];
        const message = "💀" + template.replace("{v}", victim).replace("{k}", killer);

        const taverna = await client.channels.fetch(CHANNEL_TAVERNA);
        const fofoca = await client.channels.fetch(CHANNEL_FOFOCA);

        await taverna.sendMessage(message);
        await fofoca.sendMessage(message);

    } catch (err) {
        console.error("❌ Erro ao processar deaths:", err);
    }
}

// Processa adventures.txt
async function checkAdventures(client) {
    try {
        const content = await fs.readFile(ADVENTURES_FILE, "utf-8");
        const lines = content.split("\n").filter(l => l.trim());
        if (!lines.length) return;

        const firstLine = lines[0];
        if (!firstLine || firstLine === lastAdventureLine) return;
        lastAdventureLine = firstLine;

        const [fullName, status] = firstLine.split(" had ");
        if (!status) return;

        const name = cleanName(fullName);
        let message = "";

        if (status.startsWith("entered the realm")) {
            const template = arrivalMessages[Math.floor(Math.random() * arrivalMessages.length)];
            message = "🟢 " + template.replace("{n}", name);
        } else if (status.startsWith("left the realm")) {
            const template = departureMessages[Math.floor(Math.random() * departureMessages.length)];
            message = "🔴 " + template.replace("{n}", name);
        } else return;

        const onlinePlayers = await readOnlinePlayers();
        const messageFofoca = onlinePlayers.length
            ? `${message}\n\n🟢 Atualmente temos **${onlinePlayers.length} aventureiros** no reino:\n- ${onlinePlayers.join("\n- ")}`
            : `${message}\n\n🔴 Atualmente não há nenhum aventureiro no reino.`;

        const taverna = await client.channels.fetch(CHANNEL_TAVERNA);
        const fofoca = await client.channels.fetch(CHANNEL_FOFOCA);

        await taverna.sendMessage(message);
        await fofoca.sendMessage(messageFofoca);

    } catch (err) {
        console.error("❌ Erro ao processar adventures:", err);
    }
}

// Configuração do client
const client = new Client({
    apiURL: "https://app.revolt.chat/api",
    eventURL: "wss://app.revolt.chat/events?compression=false&encoding=json",
    suppressWarnings: true,
    rejectClientErrors: false,
});

client.on("error", (err) => {
    console.warn("⚠️ Stoat.js Client Warning:", err?.message || err);
});

// Inicialização
client.on("ready", async () => {
    console.log("📌 Conectado à crônica de Sosaria");
    try {
        lastAdventureLine = (await fs.readFile(ADVENTURES_FILE, "utf-8")).split("\n")[0] || "";
        lastDeathLine = (await fs.readFile(DEATHS_FILE, "utf-8")).split("\n")[0] || "";
    } catch {}

    setInterval(() => checkAdventures(client), CHECK_INTERVAL);
    setInterval(() => checkDeaths(client), CHECK_INTERVAL);
});

// Login
await client.loginBot(FOFOCA_BOT_TOKEN)
    .then(() => console.log("✅ FOFOCA conectado!"))
    .catch(console.error);

