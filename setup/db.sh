#!/bin/bash

# Default values
MYSQL_USER=""
MYSQL_PASSWORD=""

# Function to display usage
usage() {
  echo "Usage: $0 -u <mysql_user> -p <mysql_password>"
  exit 1
}

# Parse command-line options
while getopts "u:p:" opt; do
  case $opt in
    u) MYSQL_USER=$OPTARG ;;
    p) MYSQL_PASSWORD=$OPTARG ;;
    *) usage ;;
  esac
done

# Check if both username and password are provided
if [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ]; then
  usage
fi

# Drop and recreate the database, then import the structure
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "DROP DATABASE IF EXISTS fullstack; DROP DATABASE IF EXISTS fullstack_logs; DROP DATABASE IF EXISTS fullstack_keys"

npx lerna run migrate --stream --scope=backend

# Remove files in logs if the logs directory exists and is not empty
if [ -d "packages/backend/logs" ] && [ "$(ls -A packages/backend/logs)" ]; then
    rm -rf packages/backend/logs/*
fi

# Remove files in backups if the backups directory exists and is not empty
if [ -d "packages/backend/backups" ] && [ "$(ls -A packages/backend/backups)" ]; then
    rm -rf packages/backend/backups/*
fi