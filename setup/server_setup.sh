#!/bin/bash

# Exit on any error or undefined variable
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Global variables
USER_HOME="/home/ubuntu"
DOMAIN=""
EMAIL="admin@example.com"

# Function to print status
print_status() {
    echo -e "${GREEN}[+] $1${NC}"
}

# Function to prompt user input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    read -rp "$prompt" userInput
    if [ -z "$userInput" ]; then
        echo -e "${RED}Input cannot be empty.${NC}"
        exit 1
    fi
    eval "$var_name='$userInput'"
}

# Check if script is run as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script as root or with sudo${NC}"
    exit 1
fi

# Prompt for domain name
prompt_input "Enter your domain name (e.g., example.com): " DOMAIN

print_status "Updating and upgrading system packages"
apt update && apt upgrade -y

print_status "Installing Apache"
apt install -y apache2
systemctl enable --now apache2

print_status "Installing NVM and Node.js"
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh  | bash
export NVM_DIR="$USER_HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts

print_status "Installing PM2 globally"
npm install -g pm2

# Create symlinks dynamically based on current node version
NODE_PATH="$USER_HOME/.nvm/versions/node/$(nvm current)"
ln -sf "$NODE_PATH/bin/node" /usr/bin/node
ln -sf "$NODE_PATH/bin/npm" /usr/bin/npm
ln -sf "$NODE_PATH/bin/pm2" /usr/bin/pm2

print_status "Setting up simple Node.js app"
mkdir -p "$USER_HOME/node_app" && cd "$USER_HOME/node_app"
npm init -y
npm install express

cat << 'EOF' > bundle.js
const express = require('express');
const app = express();
const port = 3006;

app.get('/', (req, res) => {
    res.send('Hello, World! This is a simple Node.js app.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
EOF

print_status "Setting up simple web app"
mkdir -p "$USER_HOME/web" && cd "$USER_HOME/web"
cat << EOF > index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Web App</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        h1 {
            font-size: 48px;
            color: #333;
        }
    </style>
</head>
<body>
    <h1>$DOMAIN</h1>
</body>
</html>
EOF

cd "$USER_HOME"

print_status "Starting PM2 processes"
pm2 serve "$USER_HOME/web" 3000 --name web --spa
pm2 start "$USER_HOME/node_app/bundle.js" --name backend
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

print_status "Configuring Apache for proxy and SSL"
a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl

# Create Apache configuration file
cat << EOF > "/etc/apache2/sites-available/$DOMAIN.conf"
<IfModule mod_ssl.c>
<VirtualHost *:80>
    ServerName $DOMAIN
    Redirect permanent / https://$DOMAIN/
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem

    # Proxy Settings
    ProxyRequests Off
    ProxyPreserveHost On
    <Proxy *>
        Require all granted
    </Proxy>

    # Backend API
    ProxyPass /api/ http://localhost:3006/
    ProxyPassReverse /api/ http://localhost:3006/

    # Frontend SPA
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Content-Security-Policy "default-src 'self'; font-src 'self'; frame-src *; frame-ancestors 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; media-src 'self' blob:; img-src 'self' data: blob:; connect-src 'self';"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Permissions-Policy "fullscreen=(self), geolocation=(self)"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"

    # CORS Setup
    SetOutputFilter INCLUDES
    RewriteEngine On
    RewriteCond %{HTTP_ORIGIN} ^https?://$DOMAIN$ [NC]
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ - [R=204,L]

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
</IfModule>
EOF

a2ensite "$DOMAIN.conf"
a2dissite 000-default.conf
systemctl reload apache2

print_status "Installing and configuring Certbot for SSL"
apt install -y certbot python3-certbot-apache
certbot --apache -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
certbot renew --dry-run

print_status "Setup complete! Your web app should be accessible at https://$DOMAIN"
echo "Node.js backend is running on port 3006, managed by PM2."
echo "Frontend is running on port 3000, managed by PM2."
echo "Check PM2 status with: pm2 list"
echo "Check Apache status with: systemctl status apache2"