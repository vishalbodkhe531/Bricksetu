#!/usr/bin/env bash
# Automated PostgreSQL Backup Script for BrickSetu
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/bricksetu}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/bricksetu_backup_${TIMESTAMP}.sql.gz"
DB_NAME="${DB_NAME:-bricksetu}"
DB_USER="${DB_USER:-postgres}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup for ${DB_NAME}..."
pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE}"

# Keep last 30 daily backups
find "${BACKUP_DIR}" -name "bricksetu_backup_*.sql.gz" -mtime +30 -delete
echo "[$(date)] Cleaned up old backups."
