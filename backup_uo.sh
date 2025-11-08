#!/bin/bash

# Local backup folder
LOCAL_BACKUP="/home/ubuntu/ecos-server/World/Backups/Automatic"

# Remote backup folder on Google Drive
REMOTE_BACKUP="nina-backup:backups/uo"

# Log file stored in your home logs folder
LOGFILE="/home/ubuntu/logs/backup_uo.log"

# Path to notifier script
NOTIFY_SCRIPT="/home/ubuntu/ecos-system/scripts/scripts/bots/notify_backup.js"

echo "$(date) - Iniciando backup do servidor UO..." >> "$LOGFILE"
/usr/bin/node "$NOTIFY_SCRIPT" "Iniciando backup diário do servidor..."

# Perform sync
rclone sync "$LOCAL_BACKUP" "$REMOTE_BACKUP" >> "$LOGFILE" 2>&1
STATUS=$?

if [ $STATUS -eq 0 ]; then
    echo "$(date) - Backup diário concluído com sucesso!" >> "$LOGFILE"
    /usr/bin/node "$NOTIFY_SCRIPT" "Backup UO concluído com sucesso! ✅"
else
    echo "$(date) - ERRO no backup!" >> "$LOGFILE"
    /usr/bin/node "$NOTIFY_SCRIPT" "ERRO: Falha no backup do servidor UO! ❌"
fi

