#!/bin/bash

# Exit on any error or undefined variable
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Global variables
USER_HOME="/home/ubuntu"
DOMAIN=""
EMAIL=""

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
prompt_input "Enter your email for Let's Encrypt (e.g., admin@example.com): " EMAIL

# -------------------------------
# System Update & Dependencies
# -------------------------------
print_status "Updating system packages"
apt update && apt upgrade -y

# -------------------------------
# Install Apache
# -------------------------------
print_status "Installing Apache"
apt install -y apache2
systemctl enable --now apache2

# -------------------------------
# Install Node.js using NVM
# -------------------------------
print_status "Installing NVM and Node.js"
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh  | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install --lts

# Create symlinks globally
NODE_PATH="$USER_HOME/.nvm/versions/node/$(nvm current)"
ln -sf "$NODE_PATH/bin/node" /usr/bin/node
ln -sf "$NODE_PATH/bin/npm" /usr/bin/npm

# -------------------------------
# Install PM2 globally
# -------------------------------
print_status "Installing PM2 globally"
npm install -g pm2

# -------------------------------
# Set up simple Node.js app
# -------------------------------
print_status "Setting up backend Node.js app"
mkdir -p "$USER_HOME/backend" && cd "$USER_HOME/backend"
npm init -y
npm install express

cat << 'EOF' > bundle.js
const express = require('express');
const app = express();
const port = 8081;

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
EOF

# -------------------------------
# Set up simple frontend app
# -------------------------------
print_status "Setting up frontend web app"
mkdir -p "$USER_HOME/web" && cd "$USER_HOME/web"
cat << EOF > index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>$DOMAIN</title>
</head>
<body>
    <h1>Welcome to $DOMAIN</h1>
</body>
</html>
EOF

cd "$USER_HOME"

# -------------------------------
# Start PM2 apps
# -------------------------------
print_status "Starting PM2 processes"
pm2 serve "$USER_HOME/web" 8082 --name web --spa -f
pm2 start "$USER_HOME/backend/bundle.js" --name backend -f
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# -------------------------------
# Initial Apache config (HTTP only)
# -------------------------------
print_status "Configuring Apache for HTTP only (port 80)"
cat << EOF > "/etc/apache2/sites-available/$DOMAIN.conf"
<IfModule mod_rewrite.c>
    ServerTokens Prod
    ServerSignature Off

    <VirtualHost *:80>
        ServerName $DOMAIN
        ServerAlias www.$DOMAIN

        RewriteEngine On
        RewriteCond %{HTTPS} off
        RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

        RewriteCond %{SERVER_NAME} =www.$DOMAIN [OR]
        RewriteCond %{SERVER_NAME} =$DOMAIN
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]

        # Allow ACME challenge path
        <Directory /var/www/html/.well-known/acme-challenge>
            AllowOverride None
            Require all granted
        </Directory>

        ErrorLog \${APACHE_LOG_DIR}/error.log
        CustomLog \${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>
</IfModule>
EOF

a2ensite "$DOMAIN.conf"
a2dissite 000-default.conf

# Enable required modules
a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl

systemctl reload apache2

# -------------------------------
# Install Certbot and get certs
# -------------------------------
print_status "Installing Certbot"
apt install -y certbot python3-certbot-apache
certbot --apache -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
certbot renew --dry-run

# Disable Certbot's generated -le-ssl.conf
a2dissite "$DOMAIN-le-ssl.conf"
rm -f "/etc/apache2/sites-available/$DOMAIN-le-ssl.conf"
systemctl reload apache2

# -------------------------------
# Replace with full Apache config (HTTPS + security)
# -------------------------------
print_status "Updating Apache config with full HTTPS and security headers"
cat << EOF > "/etc/apache2/sites-available/$DOMAIN.conf"
<IfModule mod_ssl.c>
    ServerTokens Prod
    ServerSignature Off

    # Mozilla Guideline v5.4, Apache 2.4.41, OpenSSL 1.1.1d
    SSLProtocol         all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite      ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets   off

    <VirtualHost *:80>
        ServerName $DOMAIN
        ServerAlias www.$DOMAIN

        RewriteEngine On
        RewriteCond %{HTTPS} off
        RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

        RewriteCond %{SERVER_NAME} =www.$DOMAIN [OR]
        RewriteCond %{SERVER_NAME} =$DOMAIN
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]

        <Directory /var/www/html/.well-known/acme-challenge>
            AllowOverride None
            Require all granted
        </Directory>

        ErrorLog \${APACHE_LOG_DIR}/error.log
        CustomLog \${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>

    <VirtualHost *:443>
        ServerName $DOMAIN
        ServerAlias www.$DOMAIN

        SSLEngine on
        SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem

        SSLSessionCacheTimeout 600
        LimitRequestBody 524288000

        RewriteEngine On

        # Allow CORS for subdomains of $DOMAIN
        RewriteCond %{HTTP:Origin} ^https://(.*\.)?$DOMAIN$ [NC]
        RewriteRule ^ - [E=CORS_ORIGIN:%{HTTP:Origin}]

        Header always set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN
        Header always set Access-Control-Allow-Credentials "true"
        Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        Header always set Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With"

        SetEnv no-gzip 1
        Timeout 300
        ProxyTimeout 300

        # Handle preflight (OPTIONS) requests
        <If "%{REQUEST_METHOD} == 'OPTIONS'">
           Header always set Access-Control-Max-Age "86400" env=CORS_ORIGIN
           Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, PATCH, DELETE" env=CORS_ORIGIN
           Header always set Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With" env=CORS_ORIGIN
           Header always set Access-Control-Allow-Credentials "true" env=CORS_ORIGIN
           RewriteRule ^ - [R=204,L]
        </If>

        # Security Headers
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Content-Security-Policy "default-src 'self'; font-src 'self' https://fonts.gstatic.com data:; frame-src *; frame-ancestors 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; script-src 'self' 'nonce-override' https://fonts.googleapis.com https://translate.google.com https://translate-pa.googleapis.com; media-src 'self' blob:; img-src 'self' data: blob: https://$DOMAIN https://fonts.gstatic.com https://www.gstatic.com https://www.google.com https://translate.googleapis.com https://translate.google.com; connect-src 'self' https://$DOMAIN wss://$DOMAIN https://translate.googleapis.com https://fonts.gstatic.com https://www.gstatic.com https://translate-pa.googleapis.com;"
        Header always set Referrer-Policy "no-referrer-when-downgrade"
        Header always set Permissions-Policy "fullscreen=(self), geolocation=(self)"
        Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"

        ProxyPass /api/ http://localhost:8081/
        ProxyPassReverse /api/ http://localhost:8081/

        ProxyPass "/socket.io" "ws://localhost:8081/socket.io/"
        ProxyPassReverse "/socket.io" "ws://localhost:8081/socket.io/"

        ProxyPass / http://localhost:8082/
        ProxyPassReverse / http://localhost:8082/

        ErrorLog \${APACHE_LOG_DIR}/error.log
        CustomLog \${APACHE_LOG_DIR}/access.log combined

        <Directory /var/www/html>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>

        <Directory /var/www/html/.well-known/acme-challenge>
            AllowOverride None
            Require all granted
        </Directory>

        Include /etc/letsencrypt/options-ssl-apache.conf
    </VirtualHost>
</IfModule>
EOF

# Reload Apache
systemctl reload apache2

print_status "Setup complete! Your site should now be accessible at https://$DOMAIN, and the backend at http://$DOMAIN/api/."
echo "Node.js backend is running on port 8081, managed by PM2."
echo "Frontend is running on port 8082, managed by PM2."
echo "Check PM2 status with: pm2 list"
echo "Check Apache status with: systemctl status apache2"