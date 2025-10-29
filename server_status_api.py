#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import xml.etree.ElementTree as ET
import socket
import os

# Caminhos (ajuste se necessário)
ACCOUNTS_XML = "/home/castilho/Games/sos/World/Saves/Accounts/accounts.xml"
ONLINE_FILE = "/home/castilho/Games/sos/World/Saves/Data/online.txt"

# Configurações do servidor local
HOST = "localhost"
PORT = 8080         # Porta do servidor da API
GAME_HOST = "127.0.0.1"  # IP do servidor do jogo
GAME_PORT = 2593         # Porta do servidor do jogo (ajuste conforme seu UO)
TCP_TIMEOUT = 1          # segundos para teste rápido de conexão

def is_server_online(host=GAME_HOST, port=GAME_PORT, timeout=TCP_TIMEOUT):
    """Tenta abrir conexão TCP rápida para verificar se o servidor está online."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

class RequestHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/players"):
            server_online = is_server_online()

            # Só tenta ler jogadores se o servidor estiver online
            players = []
            player_count = 0
            if server_online and os.path.exists(ONLINE_FILE):
                try:
                    with open(ONLINE_FILE, "r", encoding="utf-8") as f:
                        players = [line.strip() for line in f if line.strip()]
                        player_count = len(players)
                except Exception:
                    players = []
                    player_count = 0

            # Conta de contas (não depende do servidor estar online)
            accounts_count = 0
            if os.path.exists(ACCOUNTS_XML):
                try:
                    tree = ET.parse(ACCOUNTS_XML)
                    root = tree.getroot()
                    attr_count = root.attrib.get("count")
                    if attr_count and attr_count.isdigit():
                        accounts_count = int(attr_count)
                    else:
                        accounts_count = len(root.findall("account"))
                except Exception:
                    accounts_count = 0

            data = {
                "online": server_online,
                "count": player_count,
                "accounts": accounts_count,
                "players": players
            }

            body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

if __name__ == "__main__":
    print(f"🟢 Servidor iniciado em http://{HOST}:{PORT}/api/players")
    with HTTPServer((HOST, PORT), RequestHandler) as httpd:
        httpd.serve_forever()

